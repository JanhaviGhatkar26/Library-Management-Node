import yup from "yup";
const baseUserSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  mobile_no: yup
    .string()
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
    .required("Mobile number is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  adress: yup.string().required("Address is required"),
});
const librarianScema = baseUserSchema.shape({
  userName: yup
    .string()
    .required("username is required")
    .min(4, "Username must be at least 4 characters"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
});

const studentSchema = baseUserSchema.shape({
  studentClass: yup
    .string()
    .transform((value) => {
      // Convert the input to a number
      const numberValue = Number(value);
      return Number.isNaN(numberValue) ? null : numberValue; // Return null if conversion fails
    })
    .required("Student class is required")
    .typeError("Student class must be a number")
    .min(1, "Student class must be at least 1")
    .max(15, "Student class must be at most 15"),

  division: yup
    .string()
    .transform((value) => value?.toUpperCase()) // Automatically convert to uppercase
    .oneOf(["A", "B", "C", "D"], "Division must be one of A, B, C, or D") // Restrict input to A-D
    .required("Division is required"),
  photo: yup.required(),
});
export { librarianScema, studentSchema };

// role: yup
//   .string()
//   .oneOf(["admin", "member"], "Role must be either admin or member"),
