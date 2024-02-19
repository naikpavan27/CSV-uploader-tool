import { Component } from '@angular/core';
import { CsvRow } from '../model/csv-row.model';
import { CsvUploaderService } from 'src/app/services/csv-uploader.service';

@Component({
  selector: 'csv-uploader',
  templateUrl: './csv-uploader.component.html',
  styleUrls: ['./csv-uploader.component.scss'],
})
export class CsvUploaderComponent {
  csvData: CsvRow[] = [];
  dataBaseFields = ['Name', 'Class', 'School', 'State'];
  selectedOptions: string[] = [];
  showDropdown = false;
  suggestions: string[] = [];
  isLoading: boolean = false;

  constructor(private csvUploaderService: CsvUploaderService) {}

  // Method to check if the button should be disabled
  isButtonDisabled(): boolean {
    return this.csvData.length === 0 || this.selectedOptions.length === 0;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.parseCSV(file);
    }
  }

  // Parse the selected CSV file
  parseCSV(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const csvData: string = reader.result as string;
      this.csvData = this.csvJSON(csvData);
      // this.fetchSuggestions();
    };
    reader.readAsText(file);
  }

  // Convert the selected CSV file data into JSON format
  csvJSON(csvData: string): CsvRow[] {
    const lines = csvData.split('\n');
    const result: CsvRow[] = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const obj: CsvRow = {};
      const currentLine = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }

      result.push(obj);
    }

    return result;
  }

  // Fetch suggestions for database field mapping from GPT API
  fetchSuggestions() {
    this.isLoading = true;
    const prompt = `
      Have two JSON datas, map them and give output as JSON format:
      First JSON data:
      ${JSON.stringify(this.csvData, null, 2)}
      Second JSON data:
      ${JSON.stringify(this.selectedOptions, null, 2)}
    `;

    this.csvUploaderService
      .mapCsvToDatabaseFields(prompt)
      .subscribe((response: any) => {
        this.isLoading = false;
        this.showDropdown = false;
        const jsonString = response.choices[0].message.content;
        // Find the index of the first opening square bracket '['
        const startIndex = jsonString.indexOf('[');
        // Slice the string from the startIndex to the end to extract the JSON part
        const jsonOnlyString = jsonString.slice(startIndex);
        // Parse the extracted JSON string into a JavaScript object
        this.suggestions = JSON.parse(jsonOnlyString);
      });
  }

  // Select database fields
  selectDatabaseFields(event: any) {
    if (this.isSelected(event.target.value)) {
      this.selectedOptions = this.selectedOptions.filter(
        (item) => item !== event.target.value
      );
    } else {
      this.selectedOptions.push(event.target.value);
    }
  }

  // Toggle the dropdown
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // Select database fields
  databaseFieldOption(option: string) {
    const index = this.selectedOptions.indexOf(option);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(option);
    }
  }

  isSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }
}
