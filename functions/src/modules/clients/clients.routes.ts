import { Router } from "express";
import { ClientsController } from "./clients.controller"; 
import { validateBody } from "../../middlewares/validateBody"; 
import { createClientSchema } from "./clients.schema";

const router = Router();

router.get("/", ClientsController.getAll);  
         
router.get("/:id", ClientsController.getById);       

router.post("/", validateBody(createClientSchema), ClientsController.create);          

router.put("/:id", validateBody(createClientSchema), ClientsController.update);        

router.delete("/:id", ClientsController.delete);     

export default router;