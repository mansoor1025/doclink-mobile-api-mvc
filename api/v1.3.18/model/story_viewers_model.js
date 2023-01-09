const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const story_viewers = Schema({
  viewer_id: { type: Number },
  story_id: { type: Number },
  viewed_at: { type: String },
  device_token: { type: String },
  story_privacy: { type: String },
  deleted_at: { type: String }
});

module.exports = mongoose.model('story_viewers', story_viewers);
