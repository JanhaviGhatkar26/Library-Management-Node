import { check } from "express-validator";

const signUpVariable = [
    check('mobile_no','Mobile number should be containts 10 digits').isLength({
        min:10,
        max:10
    })
];

export default signUpVariable;