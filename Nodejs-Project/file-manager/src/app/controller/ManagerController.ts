import { Request, Response, NextFunction } from "express";
import folderBuilder from "../../helper/fbuilder";
import folderRemove from "../../helper/fremove";
import docBuilder from "../../helper/dbuilder";
import fs from "fs"
import path  from "path"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function view(req:Request,res:Response){
      const categories = await prisma.category.findMany({
            include:{files:{
                  include: {
                        docs: true // Include the documents related to each file
                  }
            }},
      })
    
      return res.render('index',{categories:categories}) 
}

export async function folder(req:Request,res:Response){
      const categories: string = req.query.categories as string;
      const name: string = req.query.name as string; 
      // const type: string = req.query.type as string; 
      const build = await prisma.file.create({
            data: {
                  categories: {
                        connect: { id: +categories } // Assuming id is the primary key of the Category table
                  },
                  folder_name:name
            },
      })
    //  folderBuilder(categories,name)

    
      
      
      
      return res.redirect('back')
}
export async function privateFolder(req:Request,res:Response){
      const categories: string = req.query.categories as string;
      const parent: string = req.query.parent as string;
      const name: string = req.query.name as string; 
      const type: string = req.query.type as string; 
      if(type=='file'){
            const build = await prisma.file.create({
                  data: {
                        categories: {
                              connect: { id: +categories } // Assuming id is the primary key of the Category table
                        },
                        parent_id:+parent,
                        folder_name:name
                  },
            })
            //folderBuilder(categories,name)
      }else if(type=='docs'){
            const fileName = name+'.txt'
            const build = await prisma.docs.create({
                  data: {
                        files: {
                              connect: { id: +parent } // Assuming id is the primary key of the Category table
                        },
                        type:'txt',
                        name:fileName
                  },
            })
            docBuilder(fileName)
           
      }
      
      
      
      return res.redirect('back')
}

export async function remove(req:Request,res:Response) {
      if(req.params.id){
           
           /*  const file = await prisma.file.findUnique({
                  where: {
                      id: +(req.params.id),
                  },
            }); */
           
            /* if(folderRemove(file.categoriesId+"/"+file.parent,file.folder_name)){
                 
            } */
             
            const deleteFile = await prisma.file.delete({
                  where: {
                    id: +(req.params.id),
                  },
            })
            return res.redirect('back')
      }
}

export async function docremove(req:Request,res:Response) {
      if(req.params.id){
            console.log(req.params.id)
            const file = await prisma.docs.delete({
                  where: {
                      id: +(req.params.id),
                  },
            });
       
            return res.redirect('back')
      }
}

export async function viewFile(req:Request,res:Response){
     
      const dirname = path.resolve(__filename,'../../../../'); // Use __filename instead of __dirname
      const folderPath = path.join(dirname, "storage");
      const doc = await prisma.docs.findUnique({
            where: {
                id: +(req.params.id),
            },
      });
      
      const fileName = doc.name;
      const readableStream = fs.createReadStream(folderPath+"/"+fileName, { encoding: 'utf8' });
      // res.setHeader('Content-Type', 'application/json');
      readableStream.pipe(res);
     
}
export async function saveFile(req:Request,res:Response){
     
      const dirname = path.resolve(__filename,'../../../../'); // Use __filename instead of __dirname
      const folderPath = path.join(dirname, "storage");
      const doc = await prisma.docs.findUnique({
            where: {
                id: +(req.params.id),
            },
      });
      const fileName = doc.name;
      const data = req.body.data;

      // Create a writable stream
      const writableStream = fs.createWriteStream(folderPath+"/"+fileName);
      writableStream.write(data);
      writableStream.end();
      
      res.json({
            status:true
      })
     
}





