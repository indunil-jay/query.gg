export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: "female" | "male";
  email: string;
  image: string;
  birthDate: string;
  address: {
    address: string;
    city: string;
    state: string;
  };
  country: string;
}
