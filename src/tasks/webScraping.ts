import axios from 'axios';
import cheerio from 'cheerio'; 

import { queryDatabase } from '../database';

async function scrapeWebsite(url: string): Promise<void> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Use cheerio to scrape data from the website
    // This is just an example, replace with actual selectors
    const data = $('selector').map((i, element) => $(element).text()).get();

    // Process the data as needed
    // This is just an example, replace with actual processing
    const processedData = data.map(item => item.trim());

    // Store the processed data in the database
    await queryDatabase('INSERT INTO table (column) VALUES (?)', [processedData]);
  } catch (error: any) {
    console.error(`Failed to scrape website: ${error.message}`);
  }
}

export default scrapeWebsite;