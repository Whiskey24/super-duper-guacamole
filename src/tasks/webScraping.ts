import axios from 'axios';
import cheerio from 'cheerio';
import { WebpageData } from '../types/index';

async function rabo(): Promise<WebpageData> {
  try {
    console.log('Fetching webpage for Rabo certificates...');
    const url: string = 'https://www.belegger.nl/obligatie-koers/600015811/default.aspx';
    const keyValues: {[key: string]: string} = {}; // Add index signature to allow indexing with a string
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    $('table.SimpleTable tr').each((index, element) => {
      const labelCell = $(element).find('td.LabelCell').text().trim();
      const valueCell = $(element).find('td.ValueCell span').text().trim();

      // Skip rows without a label or value
      if (labelCell && valueCell) {
          keyValues[labelCell] = valueCell;
      }
    });
  
  const webpageData: WebpageData = {
    url: url,
    keyValues: keyValues,
  };

  return webpageData;
  } catch (error) {
    console.error('Error fetching webpage:', error);
    throw error;
  }
}
export { rabo };