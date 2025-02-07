import { collection, getDocs, addDoc, query, where, doc } from "firebase/firestore";

/****************** TRAER TODAS LAS COLECCIONES ***************************/
export const querySnapshot = (db, col) => getDocs(collection(db, col));

/****************** AGREGA UNA COLECCION  ***************************/
export const addCollection = (db, col, object) => addDoc(collection(db, col), object); 

/****************** FILTRA POR UNA CONDICION  ***************************/
export const filterQuery = (db, col, property, condition, value) => query(collection(db, col), where(property, condition, value));

/****************** ACTUALIZA DATOS DE UNA SUBCOLECCION  ***************************/
export const updateCollection = (db, col, subCol) => doc(db, col, subCol);

/****************** TRAE LA COLLECION  ***************************/
export const getCollection = (db, col) => query(collection(db, col));
