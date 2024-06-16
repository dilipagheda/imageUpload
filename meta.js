
const exif = require('exif');
const ExifImage = exif.ExifImage
const datefns = require("date-fns");
const {promisify} = require('util')
const exifImage = promisify(ExifImage)
const mediafileMetadata = require("mediafile-metadata");


const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const getDateMeta = async (path) => {
  try {
    
    const exifData = await exifImage({ image : path });

    const createDate = exifData.exif.CreateDate
    const parsedDate = datefns.parse(createDate, 'yyyy:MM:dd HH:mm:ss', new Date())
    result = {
      year: parsedDate.getFullYear(),
      month: months[parsedDate.getMonth()] || 'Unknown',
      date: createDate
    }
    return result

  } catch (error) {
      console.log('Error: ' + error.message);
      console.log('Trying mediafileMetadata')
      try{
        const essentials = await mediafileMetadata.getEssentials(path); // path to photo or video file
        if(essentials) {
          const parsedDate = datefns.constructFrom(essentials.creationDate, essentials.creationDate)
          result = {
            year: parsedDate.getFullYear(),
            month: months[parsedDate.getMonth()] || 'Unknown',
            date: essentials.creationDate
          }
          return result
        }else{
          console.log('mediafileMetadata could not obtain meta data')
          return null
        }
      }catch(e) {
        console.log(e)
        return null
      }


      return null
  }
}

module.exports = getDateMeta

