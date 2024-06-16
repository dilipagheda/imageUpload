#! /usr/bin/env node

const Path = require('path')
const {
  S3Client,
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  HeadObjectCommand
} = require("@aws-sdk/client-s3");

const getDateMeta = require('./meta')
const fs = require('fs')
const recursive = require("recursive-readdir");
const dotenv = require('dotenv');
dotenv.config({path: Path.resolve(__dirname, '.env')});

const path = Path.join(process.cwd())

async function uploadToS3(result, file) {
  
  const key = `${result.year}/${result.month}/${Path.basename(file)}`
  
  const s3Client = new S3Client({
    region:process.env.REGION, 
    credentials: {
      accessKeyId:process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: fs.createReadStream(file)
  };
  const getObjectCommand = new HeadObjectCommand(params)

  const putObjectCommand = new PutObjectCommand(params);

  try {
    const getObjectCommandResponse = await s3Client.send(getObjectCommand)
    if(getObjectCommandResponse.$metadata.httpStatusCode == 200) {
      console.log(`skipped-200-file already exists with key - ${key}`)
    }else {
      console.log(`skipped-unknown-file already exists with key - ${key}`)
    }
  } catch (err) {
    if(err.$metadata.httpStatusCode === 404) {
      try{
        const response = await s3Client.send(putObjectCommand);
        console.log(`uploaded - file uploaded with key - ${key}`)
      }catch(e) {
        console.log(e)
      }

    }
  }
}

async function main() {

  const files = await recursive(path)

  for(let i=0; i<files.length; i++) {
    const file = files[i]
    try{
      const fileMeta = await getDateMeta(file)
      if(fileMeta !== null) {
        console.log(`Processing file-${file}`)
        await uploadToS3(fileMeta, file)
      }
    }catch(error) {
      console.log(error)
    }
  }
}

main()
