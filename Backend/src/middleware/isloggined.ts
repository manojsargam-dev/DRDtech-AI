import  type{ JwtPayload } from "jsonwebtoken";
import jwt from 'jsonwebtoken'
import type{ Request,Response,NextFunction } from 'express'

// export const isloggined =async (req:Request,res:Response)=>{
//     const token = await req.cookies.token;
//     if(token === ' '){
//         return res.status(401).send("PLEASE LOGIN !!!");
//     }
//     else{
//         try {
//         const decode = jwt.verify(token,process.env.SECRET as string);
//         console.log(decode);
//         res.status(200).send("valid");
//         } catch (error) {
//             console.log(error);
//         }
//     }
// }
interface AuthRequest extends Request {
  user?: string | JwtPayload;
}
export const isloggined = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || (req.headers.authorization?.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "PLEASE LOGIN !!!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Invalid token" });
  }
};
