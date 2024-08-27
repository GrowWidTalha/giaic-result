'use server'

import { readFile } from 'fs/promises'
import * as XLSX from 'xlsx'
import NodeCache from 'node-cache'

// Initialize cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

interface StudentData {
  'Student_Registration_Number': string;
  'Quarter 1 Exam Result': string;
  [key: string]: string; // For any additional columns
}

async function readAndCacheExcelData() {
  try {
    const buffer = await readFile('./data/students.xlsx')
    const workbook = XLSX.read(buffer, { cellText: false, cellDates: true })

    const allSheets: { [sheetName: string]: StudentData[] } = {};

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
        defval: '',
      }) as StudentData[]

      // Validate and clean data
      const cleanedData = jsonData.map(row => {
        const cleanRow: StudentData = {
          'Student_Registration_Number': String(row['Student_Registration_Number'] || '').trim(),
          'Quarter 1 Exam Result': String(row['Quarter 1 Exam Result'] || '').trim(),
        };
        return cleanRow;
      }).filter(row => row['Student_Registration_Number'] && row['Quarter 1 Exam Result']);

      allSheets[sheetName] = cleanedData;
    })

    cache.set('excelData', allSheets)
    return allSheets
  } catch (error) {
    console.error('Error reading Excel file:', error)
    throw error
  }
}

function getMotivationalQuote(passed: boolean): string {
  const passedQuotes = [
    "Congratulations! Your hard work has paid off. Keep pushing forward!",
    "Success is the sum of small efforts repeated day in and day out. Well done!",
    "You've proven that you have what it takes. Now, aim even higher!",
  ];

  const failedQuotes = [
    "Every setback is a setup for a comeback. Keep your head up and try again!",
    "Failure is not the opposite of success, it's part of success. Learn from this and grow stronger!",
    "The only true failure is giving up. You've got this, keep pushing forward!",
  ];

  const quotes = passed ? passedQuotes : failedQuotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export async function getStudentStatus(rollNumber: string) {
  try {
    let allSheets = cache.get('excelData') as { [sheetName: string]: StudentData[] } | undefined

    if (!allSheets) {
      allSheets = await readAndCacheExcelData()
    } else {
      console.log('Using cached data.');
    }

    const cleanRollNumber = rollNumber.trim().padStart(8, '0');

    for (const sheetName in allSheets) {
      const student = allSheets[sheetName].find(row => {
        const rowRollNumber = row['Student_Registration_Number'].trim().padStart(8, '0');
        return rowRollNumber === cleanRollNumber;
      });

      if (student) {
        return {
          rollNumber: student['Student_Registration_Number'],
          status: 'Pass',
          sheet: sheetName,
          message: getMotivationalQuote(true)
        }
      }
    }

    return {
      rollNumber: cleanRollNumber,
      status: 'Fail',
      message: getMotivationalQuote(false)
    }
  } catch (error) {
    console.error('Error getting student status:', error)
    return { error: 'An error occurred while fetching the data' }
  }
}

export async function refreshCache() {
  try {
    await readAndCacheExcelData()
    return { success: true, message: 'Cache refreshed successfully' }
  } catch (error) {
    console.error('Error refreshing cache:', error)
    return { success: false, message: 'Failed to refresh cache' }
  }
}
