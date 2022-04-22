import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_ASSETS_BUCKET_NAME,
  MAX_FILE_SIZE,
  MAX_TOTAL_FILES_SIZE,
  ENV,
  ASSETS_STORAGE,
  ASSETS_BASE_URL,
} from './../constants';
import { Repository } from 'typeorm/repository/Repository';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { v4 as uuidv4 } from 'uuid';

import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { getRepository } from 'typeorm';
import { diskStorage } from 'multer';
import { IAudioMetadata, parseBuffer } from 'music-metadata';

if (ENV === 'prod')
  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

const s3 = new AWS.S3();

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  findAll() {
    return this.fileRepository.find();
  }

  findOne(id: number) {
    return this.fileRepository.findOne(id);
  }

  isMulterS3File(
    file: Express.MulterS3.File | Express.Multer.File,
  ): file is Express.MulterS3.File {
    return !!(file as Express.MulterS3.File).acl;
  }

  async getFileMetadata(
    file: Express.MulterS3.File | Express.Multer.File,
  ): Promise<IAudioMetadata | undefined> {
    if (!file.buffer) return undefined;
    try {
      const fileMetadata = await parseBuffer(file.buffer, file.mimetype);

      return fileMetadata;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async saveFileData(
    file: Express.MulterS3.File | Express.Multer.File,
    name?: string,
  ): Promise<File> {
    let fileData: Partial<File> = {};

    const fileMetadata = await this.getFileMetadata(file);

    if (this.isMulterS3File(file)) {
      fileData = {
        url: file.location,
        key: file.key,
        acl: file.acl,
        originalName: file.originalname,
        name: name ?? file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        length: fileMetadata?.format.duration,
        bitRate: fileMetadata?.format.bitrate,
      };
    } else {
      fileData = {
        url: `${ASSETS_BASE_URL}/${file.filename}`,
        key: file.filename,
        acl: '',
        originalName: file.originalname,
        name: name ?? file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        length: fileMetadata?.format.duration,
        bitRate: fileMetadata?.format.bitrate,
      };
    }

    const savedFile = await this.fileRepository.save({
      ...fileData,
      createdAt: new Date().toISOString(),
    });

    const totalFileSize = await this.getTotalFilesSize();

    if (totalFileSize > MAX_TOTAL_FILES_SIZE) {
      await this.remove(savedFile.id);
      throw new ServiceUnavailableException({
        message: 'Server storage is fully used.',
      });
    }

    return savedFile;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  async remove(id: number) {
    const file = await this.findOne(id);

    if (!file)
      throw new BadRequestException({ message: 'Given file does not exist.' });

    // TODO: error handling?
    if (ASSETS_STORAGE === 'external' && file.key)
      s3.deleteObject(
        { Bucket: AWS_ASSETS_BUCKET_NAME, Key: file.key },
        (err) => {
          if (err) console.log(err);
        },
      );

    await this.fileRepository.delete(file);

    return;
  }

  async getTotalFilesSize() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const totalSize = +(
        await getRepository(File)
          .createQueryBuilder('file')
          .select('SUM(file.size)', 'total_size')
          .getRawOne()
      )['total_size'];
      return totalSize;
    } catch (e) {
      throw new ServiceUnavailableException();
    }
  }

  static getMulterFilename(
    _: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error, filename: string) => void,
  ) {
    const id = uuidv4();

    if (file.mimetype === 'audio/mpeg') return cb(null, id + '.mp3');
    if (file.mimetype === 'audio/wave') return cb(null, id + '.wav');
    if (file.mimetype === 'audio/wav') return cb(null, id + '.wav');

    cb(
      new BadRequestException({
        message: 'File format not supported.',
      }),
      null,
    );
  }

  static multerS3Storage =
    ASSETS_STORAGE === 'external'
      ? multerS3({
          s3: s3,
          bucket: AWS_ASSETS_BUCKET_NAME,
          acl: 'public-read',
          metadata: function (_, file, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          // eslint-disable-next-line @typescript-eslint/unbound-method
          key: FileService.getMulterFilename,
        })
      : null;

  static multerLocalStorage = diskStorage({
    destination: function (_, __, cb) {
      cb(null, 'files/audio');
    },

    // eslint-disable-next-line @typescript-eslint/unbound-method
    filename: FileService.getMulterFilename,
  });

  static audioFileInterceptorOptions: MulterOptions = {
    limits: {
      files: 1,
      fileSize: MAX_FILE_SIZE,
    },
    storage:
      ASSETS_STORAGE === 'local'
        ? FileService.multerLocalStorage
        : FileService.multerS3Storage,
  };
}
