const State = require('../models/States');
const path = require('path');
const fs = require('fs');

// Load states data from JSON file once at startup
const statesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'statesData.json'))
);

// Helper: Get state data by code (case-insensitive)
function getStateDataByCode(code) {
  return statesData.find(
    (state) => state.code.toUpperCase() === code.toUpperCase()
  );
}

// Helper: Merge fun facts from MongoDB into state data
async function mergeFunFacts(state) {
  const funFactsDoc = await State.findOne({ stateCode: state.code });
  if (funFactsDoc && funFactsDoc.funfacts && funFactsDoc.funfacts.length > 0) {
    return { ...state, funfacts: funFactsDoc.funfacts };
  }
  return state;
}

// Helper: Validate state code
const validStateCodes = new Set(statesData.map(state => state.code.toUpperCase()));
function isValidStateCode(code) {
  return validStateCodes.has(code.toUpperCase());
}

// GET /states/
exports.getAllStates = async (req, res) => {
  let filteredStates = statesData;

  // Handle contig query param
  if (req.query.contig === 'true') {
    filteredStates = statesData.filter(
      (state) => state.code !== 'AK' && state.code !== 'HI'
    );
  } else if (req.query.contig === 'false') {
    filteredStates = statesData.filter(
      (state) => state.code === 'AK' || state.code === 'HI'
    );
  }

  // Merge fun facts for all states
  const statesWithFunFacts = await Promise.all(
    filteredStates.map(mergeFunFacts)
  );
  res.json(statesWithFunFacts);
};

// GET /states/:state
exports.getState = async (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const state = getStateDataByCode(code);
  const merged = await mergeFunFacts(state);
  res.json(merged);
};

// GET /states/:state/funfact
exports.getRandomFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const funFactsDoc = await State.findOne({ stateCode: code });
  if (!funFactsDoc || !funFactsDoc.funfacts || funFactsDoc.funfacts.length === 0) {
    return res.status(404).json({ message: 'No Fun Facts found for this state' });
  }
  const randomFact =
    funFactsDoc.funfacts[Math.floor(Math.random() * funFactsDoc.funfacts.length)];
  res.json({ funfact: randomFact });
};

// GET /states/:state/capital
exports.getCapital = (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const state = getStateDataByCode(code);
  res.json({ state: state.state, capital: state.capital_city });
};

// GET /states/:state/nickname
exports.getNickname = (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const state = getStateDataByCode(code);
  res.json({ state: state.state, nickname: state.nickname });
};

// GET /states/:state/population
exports.getPopulation = (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const state = getStateDataByCode(code);
  res.json({ state: state.state, population: state.population });
};

// GET /states/:state/admission
exports.getAdmission = (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const state = getStateDataByCode(code);
  res.json({ state: state.state, admitted: state.admission_date });
};

// POST /states/:state/funfact
exports.addFunFacts = async (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const { funfacts } = req.body;
  if (!funfacts || !Array.isArray(funfacts) || funfacts.length === 0) {
    return res.status(400).json({ message: 'State fun facts value required' });
  }
  let funFactsDoc = await State.findOne({ stateCode: code });
  if (funFactsDoc) {
    funFactsDoc.funfacts.push(...funfacts);
    await funFactsDoc.save();
  } else {
    funFactsDoc = await State.create({ stateCode: code, funfacts });
  }
  res.json(funFactsDoc);
};

// PATCH /states/:state/funfact
exports.updateFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const { index, funfact } = req.body;
  if (!index) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  if (!funfact) {
    return res.status(400).json({ message: 'State fun fact value required' });
  }
  const funFactsDoc = await State.findOne({ stateCode: code });
  if (!funFactsDoc || !Array.isArray(funFactsDoc.funfacts) || funFactsDoc.funfacts.length === 0) {
    return res.status(404).json({ message: 'No Fun Facts found for this state' });
  }
  const idx = index - 1; // Convert to zero-based
  if (idx < 0 || idx >= funFactsDoc.funfacts.length) {
    return res.status(400).json({ message: 'No Fun Fact found at that index for the state' });
  }
  funFactsDoc.funfacts[idx] = funfact;
  await funFactsDoc.save();
  res.json(funFactsDoc);
};

// DELETE /states/:state/funfact
exports.deleteFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  if (!isValidStateCode(code)) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  const { index } = req.body;
  if (!index) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  const funFactsDoc = await State.findOne({ stateCode: code });
  if (!funFactsDoc || !Array.isArray(funFactsDoc.funfacts) || funFactsDoc.funfacts.length === 0) {
    return res.status(404).json({ message: 'No Fun Facts found for this state' });
  }
  const idx = index - 1; // Convert to zero-based
  if (idx < 0 || idx >= funFactsDoc.funfacts.length) {
    return res.status(400).json({ message: 'No Fun Fact found at that index for the state' });
  }
  funFactsDoc.funfacts.splice(idx, 1);
  await funFactsDoc.save();
  res.json(funFactsDoc);
};