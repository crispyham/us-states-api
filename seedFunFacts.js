require('dotenv').config();
const mongoose = require('mongoose');
const State = require('./models/States');

const funFactsData = [
  {
    stateCode: 'KS',
    funfacts: [
      "Kansas is home to the geographic center of the 48 contiguous United States.",
      "Dodge City, KS is the windiest city in the United States.",
      "The first Pizza Hut opened in Wichita, Kansas in 1958."
    ]
  },
  {
    stateCode: 'MO',
    funfacts: [
      "Missouri is known as the 'Show Me State', a phrase that reflects its residents' skepticism.",
      "The ice cream cone was popularized at the 1904 World's Fair in St. Louis.",
      "Branson, Missouri has more theater seats than Broadway."
    ]
  },
  {
    stateCode: 'OK',
    funfacts: [
      "Oklahoma has the largest Native American population of any state.",
      "The parking meter was invented in Oklahoma City in 1935.",
      "Oklahoma is the only state that produces iodine."
    ]
  },
  {
    stateCode: 'NE',
    funfacts: [
      "Nebraska is the only state in the U.S. with a unicameral (single-house) legislature.",
      "The world's largest indoor rainforest is located at Omaha's Henry Doorly Zoo.",
      "Kool-Aid was invented in Hastings, Nebraska in 1927."
    ]
  },
  {
    stateCode: 'CO',
    funfacts: [
      "Colorado has the highest average elevation of any state.",
      "The world's largest flat-top mountain is in Grand Mesa, Colorado.",
      "Colorado was the first state to legalize recreational marijuana."
    ]
  }
];

const seedFunFacts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (const state of funFactsData) {
      await State.findOneAndUpdate(
        { stateCode: state.stateCode },
        { $set: { funfacts: state.funfacts } },
        { upsert: true, new: true }
      );
    }

    console.log('Fun facts seeded successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding fun facts:', err);
    mongoose.disconnect();
  }
};

seedFunFacts();