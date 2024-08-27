'use server'

import NodeCache from 'node-cache';

interface StudentData {
  Student_Registration_Number: string;
  Quarter_1_Exam_Result: string;
}

interface AllSheetsData {
  [sheetName: string]: StudentData[];
}

// Initialize NodeCache instance
const cache = new NodeCache({ stdTTL: 36000000 }); // Cache for 1 hour

// URL of the GitHub Gist containing the JSON file
const GIST_URL = 'https://gist.githubusercontent.com/GrowWidTalha/06a4af8613d3decb2db1fbcb0c203482/raw/3e673788ceffe17f71700945d4294745cca95090/students.json';

async function fetchJsonFile(): Promise<AllSheetsData> {
  const cachedData = cache.get<AllSheetsData>('studentsData');

  if (cachedData) {
    console.log('Returning data from cache');
    return cachedData;
  }

  console.log('Fetching data from GitHub Gist');
  const response = await fetch(GIST_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON data: ${response.statusText}`);
  }

  const jsonData = await response.json();
  cache.set('studentsData', jsonData); // Cache the data
  return jsonData as AllSheetsData;
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
    const allSheets = await fetchJsonFile();

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
        };
      }
    }

    console.log(`Student with roll number ${cleanRollNumber} not found in any sheet.`);
    return {
      rollNumber: cleanRollNumber,
      status: 'Fail',
      message: getMotivationalQuote(false)
    };
  } catch (error) {
    console.error('Error getting student status:', error);
    return { error: 'An error occurred while fetching the data' };
  }
}

export async function refreshCache() {
  cache.del('studentsData');
  console.log('Cache refreshed successfully');
  return { success: true, message: 'Cache refreshed successfully' };
}
