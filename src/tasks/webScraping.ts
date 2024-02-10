import axios from 'axios';
import cheerio from 'cheerio';
import { WebpageData } from '../types/index';

async function beleggerNl(id: number): Promise<WebpageData> {
  console.log(`Fetching beleggerNL webpage for id ${id}`);
  const url: string = `https://www.belegger.nl/obligatie-koers/${id}/default.aspx`;
  try {
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
      status: "success"
    };

    return webpageData;
  } catch (error) {
    console.error('Error fetching webpage:', error);
    
    const webpageData: WebpageData = {
      url: url,
      keyValues: { errormsg: "Er is iets misgegaan met het ophalen van de informatie."},
      status: "failed"
    };
    return webpageData;
    
  }
}
export { beleggerNl };