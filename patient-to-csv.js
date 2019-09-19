const fs = require('fs');
const { parse } = require('json2csv');
const path = require('path');
const program = require('commander');
const _ = require('lodash');

program
  .option ('-f, --file <file>', 'Path to the json file to parse')
  .usage(' -f /path/to/file.json')
  .parse(process.argv);

if (!(program.file && fs.existsSync(program.file))) {
  console.error('Error: Specified file does not exist');
  program.help();
  process.exit(1);
}

if (!fs.existsSync('./output')){
  fs.mkdirSync('./output');
}

function safe(obj) {
  return new Proxy(obj, {
    get(target, name) {
      const result = target[name];
      if (!!result) {
        return (result instanceof Object)? safe(result) : result;
      }
      return safe({});
    }
  });
}

const getNamespace = (url) => url.substring(url.lastIndexOf('/')+1);
const getCodeValue = o => o.Value.Coding[0].CodeValue.Value;
const getCodeableConceptDisplayText = o => o.Value.Coding[0].DisplayText.Value;
const getCodingTuple = o => { return { displayText: getCodeableConceptDisplayText(o), codeValue: getCodeValue(o) } };
const getVitalValue = (o, useUnits = true) => `${o.Value.Number.Value}${useUnits ? ' ' + o.Value.Units.Value.CodeValue.Value : ''}`;

const output = [];
const seenDataElements = [];
const entries = JSON.parse(fs.readFileSync(program.file, 'utf8'));

entries.forEach(entry => {
  const safeEntry = safe(entry);
  const entryType = getNamespace(safeEntry.EntryType.Value);
  switch(entryType) {
    case 'Patient':
      processPatientInfo(safeEntry, entryType);
      break;
    case 'CancerCondition':
      processCancerCondition(safeEntry, entryType);
      break;
    case 'TNMClinicalDistantMetastasesCategory':
    case 'TNMClinicalRegionalNodesCategory':
    case 'TNMClinicalPrimaryTumorCategory':
    case 'TNMClinicalStageGroup':
      processClinicalStageGroup(safeEntry, entryType);
      break;
    case 'GeneticMutationTestResult':
      processGeneticTest(safeEntry, entryType);
      break;
    case 'BodyWeight':
      addRow({
        Weight: getVitalValue(entry.DataValue)
      }, 'Vitals');
      break;
    case 'BloodPressure':
      addRow({
        'Blood Pressure': `${getVitalValue(entry.Components[0].DataValue, false)}/${getVitalValue(entry.Components[1].DataValue, false)}`
      }, 'Vitals');
      break;
    case 'MedicationStatement':
      processMedicationStatement(safeEntry, entryType);
      break;
    case 'CancerDiseaseStatus':
      addRow({
        'Disease Status': getCodingTuple(entry.DataValue) 
      }, entryType);
      break;
    default:
      break 
  }
});

function addRow(data, entryType) {
  for(let key in data) {
    const dataElementId = `${entryType}-${key}`;
    if (!_.isEmpty(data[key]) && !_.includes(seenDataElements, dataElementId)) {
      const { displayText, codeValue } = _.isObject(data[key]) ? data[key] : { displayText: data[key], codeValue: '' };

      if (_.isEmpty(displayText) && _.isEmpty(codeValue)) continue;
      output.push({
        domain: entryType,
        element: key,
        value: !_.isEmpty(displayText) ? displayText : '',
        code: !_.isEmpty(codeValue) ? codeValue : ''
      });
      seenDataElements.push(dataElementId);
    }
  }
}

function processPatientInfo(entry, entryType) {
  const data = {
    'Date of Birth': entry.Person.DateOfBirth.Value,
    'Administrative Gender': getCodingTuple(entry.Person.AdministrativeGender),
    'Race': getCodingTuple(entry.Person.Race.RaceCode),
    'Ethnicity': getCodingTuple(entry.Person.Ethnicity.EthnicityCode)
  };

 addRow(data, entryType); 
}

function processCancerCondition(entry, entryType) {
  const data = {
    'Body Location': getCodingTuple(entry.BodyLocation[0].LocationCode),
    'Clinical Status': getCodingTuple(entry.ClinicalStatus),
    'Condition': getCodingTuple(entry.Code),
    'Date of Diagnosis': entry.Onset.Value
  };

 addRow(data, entryType); 
}

function processClinicalStageGroup(entry, entryType) {
  const data = {
    'Stage Group': getCodingTuple(entry.DataValue),
    'Staging System': getCodingTuple(entry.Method)
  };

  addRow(data, entryType);
}

function processGeneticTest(entry, entryType) {
  const data = {
    'Test Result': getCodingTuple(entry.DataValue),
    'Mutation Tested Variant Identifier': getCodingTuple(entry.MutationTested.VariantIdentifier)
  };
  
  addRow(data, entryType);
}

function processMedicationStatement(entry, entryType) {
  const medCodeOrRef = getCodeableConceptDisplayText(entry.MedicationCodeOrReference);

  let med;
  if (_.isEmpty(medCodeOrRef)) {
    med = getCodingTuple(entries.find(e => entry.MedicationCodeOrReference.Value._EntryId === e.EntryId.Value).Type);
  } else {
    med = medCodeOrRef;
  }

  const data = {
    'Medication': med,
    'Termination Reason': getCodingTuple(entry.ReasonCode[0]),
    'Treatment Intent': getCodingTuple(entry.TreatmentIntent),
    'Start Date': entry.OccurrenceTimeOrPeriod.Value.BeginDateTime.Value,
    'End Date': entry.OccurrenceTimeOrPeriod.Value.EndDateTime.Value
  };

  addRow(data, entryType);
}

fs.writeFileSync(`./output/${path.parse(path.basename(program.file)).name}.csv`, parse(output), 'utf8');
