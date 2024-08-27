'use server'

import { readFile } from 'fs/promises'
import { cache } from 'react'
import path from 'path'

interface StudentData {
  Student_Registration_Number: string;
  Quarter_1_Exam_Result: string;
}

interface AllSheetsData {
  [sheetName: string]: StudentData[];
}

const readJsonFile = cache(async () => {
    const filePath = path.resolve(process.cwd(), 'public', 'students.json');

  const jsonData = await readFile(filePath, 'utf-8')
  return JSON.parse(jsonData) as AllSheetsData
})

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
    const allSheets = await readJsonFile()

    const cleanRollNumber = rollNumber.trim().padStart(8, '0');
    console.log(`Searching for roll number: ${cleanRollNumber}`);

    for (const sheetName in allSheets) {
      console.log(`Searching in sheet: ${sheetName}`);
      const student = allSheets[sheetName].find(row =>
        row.Student_Registration_Number.trim().padStart(8, '0') === cleanRollNumber
      );

      if (student) {
        console.log(`Student found in sheet ${sheetName}`);
        return {
          rollNumber: student.Student_Registration_Number,
          status: 'Pass',
          sheet: sheetName,
          message: getMotivationalQuote(true)
        }
      }
    }

    console.log(`Student with roll number ${cleanRollNumber} not found in any sheet.`);
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
  // In this case, we don't need to manually refresh the cache
  // as we're using React's cache function which will automatically
  // revalidate on each request in production
  return { success: true, message: 'Cache refreshed successfully' }
}
