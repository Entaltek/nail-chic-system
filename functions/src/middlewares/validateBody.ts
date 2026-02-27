import {Request, Response, NextFunction} from "express";

export const validateBody =
  (schema: any) =>
    (req: Request, res: Response, next: NextFunction): void => {
      const {error} = schema.validate(req.body);

      if (error) {
        res.status(400).json({error: error.details[0].message});
        return; // aquí solo termina la función, no retornas el Response
      }

      next();
    };


