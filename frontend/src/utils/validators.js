import { VALIDATION_RULES,ERROR_MESSAGES } from "./constants.js";

export const validateEmail=(email)=>{
    if(!email || email.trim()===''){
        return {isValid:false,error: ERROR_MESSAGES.INVALID_EMAIL};
        
    }
    if(!VALIDATION_RULES.EMAIL_REGEX.test(email)){
        return {isValid:false,error: ERROR_MESSAGES.INVALID_EMAIL};
    }

    return {isValid: true, error: null};

}



export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }
  
  return { isValid: true, error: null };
};




export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_PHONE };
  }
  
  return { isValid: true, error: null };
};



export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters` };
  }
  
  return { isValid: true, error: null };
};


export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Please select a file' };
  }
  
  // Check file type
  if (!VALIDATION_RULES.ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
  }
  
  // Check file size
  if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }
  
  return { isValid: true, error: null };
};



export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
};


export const validateCoordinates = (lng, lat) => {
  const longitude = parseFloat(lng);
  const latitude = parseFloat(lat);
  
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  return { isValid: true, error: null };
};




export const validateForm = (validations) => {
  const errors = {};
  
  Object.keys(validations).forEach((field) => {
    const validation = validations[field];
    if (!validation.isValid) {
      errors[field] = validation.error;
    }
  });
  
  // Return null if no errors, otherwise return errors object
  return Object.keys(errors).length > 0 ? errors : null;
}