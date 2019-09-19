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

Example Output (`./output/GistAdjuvantIhanosV09.csv`):

```
"domain","element","value","code"
"Patient","Date of Birth","12 Feb 1962",""
"Patient","Administrative Gender","","Male"
"Patient","Race","","white"
"Patient","Ethnicity","Hispanic or Latino","2135-2"
"CancerCondition","Body Location","Stomach","69695003"
"CancerCondition","Clinical Status","","remission"
"CancerCondition","Condition","Gastrointestinal stromal tumor","420120006"
"CancerCondition","Date of Diagnosis","27 Dec 2016",""
"GeneticMutationTestResult","Test Result","Positive","C1446409"
"GeneticMutationTestResult","Mutation Tested Variant Identifier","KIT exon 11 mutation","C104668"
"TNMClinicalStageGroup","Stage Group","IIIA","261638004"
"TNMClinicalStageGroup","Staging System","GIST Staging Guide, Version 7","v7"
"TNMClinicalPrimaryTumorCategory","Stage Group","T3","369918000"
"TNMClinicalRegionalNodesCategory","Stage Group","N0","103802014"
"TNMClinicalDistantMetastasesCategory","Stage Group","M0","51703010"
"CancerDiseaseStatus","Disease Status","Complete resection","C0015250"
"Vitals","Blood Pressure","143/89",""
"Vitals","Weight","137 lbs",""
```


## Importing Into Excel

1) In excel, click `File > Import`
2) Select "CSV File" and select the relevant output file
3) Select "Delimited" and click next
4) Under "Delimiters", select "Comma." Deselect other options
5) Click finish
