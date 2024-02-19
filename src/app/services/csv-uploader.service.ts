import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CsvUploaderService {
  apiUrl =
    'https://zimegpt35-east2.openai.azure.com/openai/deployments/GPT3-5-Turbo/chat/completions?api-version=2023-03-15-preview'; // Replace with the actual API endpoint
  apiKey = '4d9baa6b7a4e42d3b6e89f98bfc84f16'; // Replace with your API key

  constructor(private http: HttpClient) {}

  mapCsvToDatabaseFields(prompt: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': this.apiKey,
    });

    const payload = {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3206,
      temperature: 0,
      stream: false,
    };

    return this.http.post(this.apiUrl, payload, { headers });
  }
}
