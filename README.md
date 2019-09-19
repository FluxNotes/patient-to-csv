# SHR Patients to CSV

CLI for converting hardcoded mCODE v0.9.0 patients to CSV format

## Usage

```
Usage: patient-to-csv  -f /path/to/file.json

Options:
  -f, --file <file>  Path to the json file to parse
  -h, --help         output usage information
```

Example:

```bash
$ node patient-to-csv.js patients/GistAdjuvantIhanosV09.json
```

Output files are written to `./output/<filename>.csv`


## Importing Into Excel

1) In excel, click `File > Import`
2) Select "CSV File" and select the relevant output file
3) Select "Delimited" and click next
4) Under "Delimiters", select "Comma." Deselect other options
5) Click finish