var userSchema = { // TODO: ERROR: User is not a constructor 
    fullname: {
        type: String,
    },
    email: {
      type: String,
      unique: [true, "email already exists in database"],
      lowercase: true,
      required: [true, "email not provided"],
    },
    role: {
      type: String,
      enum: ["admin", "research_assistant"],
      required: [true, "Please specify user role"]
    },
    password: {
      type: String,
      required: true
    }
}

module.exports = userSchema;