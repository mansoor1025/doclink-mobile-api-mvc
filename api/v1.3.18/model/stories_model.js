const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const stories = Schema({
    story_id:{ type: Number },
    user_id: { type: Number },
    caption: { type: String },
    story_type: { type: String },
    stories_user_type: { type: String },
    raw_data: { type: String },
    image: { type: String },
    seconds: { type: Number },
    viewers_count:{ type: Number },
    is_active:{ type: Number },
    story_privacy: { type: String},
    created_at: { type: String},
    created_at_story: { type: String},
    updated_at:{ type: String}
  });
  
module.exports = mongoose.model('stories', stories);
