import { evaluate } from 'mathjs';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { writeToPath } from '@fast-csv/format';

const inputCSVFilePath = path.resolve(__dirname, 'assets/input.csv');
const outputCSVFilePath = path.resolve(__dirname, 'assets/output.csv');
const delimiter = ',';

function csvEvaluation(
  delimiter: string,
  inputCSVFilePath: string,
  outputCSVFilePath: string,
): void {
  const fileContent = fs.readFileSync(inputCSVFilePath, { encoding: 'utf-8' });

  parse(
    fileContent,
    {
      delimiter,
    },
    (error: any, data: any) => {
      if (error) {
        console.error(error);
      }
      const firstRow = data[0];
      const alphabet = createAlphabet(firstRow.length);

      // Set value for column letters
      const scope = createValueMap(firstRow, alphabet);

      // Evaluate data of all rows
      const evaluatedData = evaluateData(firstRow, data, scope);

      // Write data to output.csv file
      writeToPath(outputCSVFilePath, evaluatedData)
        .on('error', (err) => console.error(err))
        .on('finish', () => console.log('Done Evaluating CSV.'));
    },
  );
}

function createAlphabet(numberOfCols: number): string[] {
  // Generate array of alphabet from the number of columns
  const alpha = Array.from(Array(numberOfCols)).map((e, i) => i + 65);
  return alpha.map((x) => String.fromCharCode(x));
}

function createValueMap(
  row: string[],
  alphabet: string[],
): Record<string, number> {
  // Set value for column letters
  return row.reduce((acc: any, cur: string, i: number) => {
    acc[alphabet[i]] = cur;
    return acc;
  }, {});
}

function evaluateData(
  firstRow: string[],
  data: string[][],
  scope: Record<string, number>,
): number[][] {
  const evaluatedData = [];
  // Evaluate data of all rows
  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const row = [];
    for (let colIdx = 0; colIdx < data[rowIdx].length; colIdx++) {
      row.push(parseFloat(evaluate(data[rowIdx][colIdx], scope)));
    }
    evaluatedData.push(row);
  }

  // Merge first row with the rest calculated rows
  evaluatedData.unshift(firstRow.map((e: string) => parseFloat(e)));

  return evaluatedData;
}

csvEvaluation(delimiter, inputCSVFilePath, outputCSVFilePath);
