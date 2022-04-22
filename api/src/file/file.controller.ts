import { RolesGuard } from './../auth/guards/user-roles.guard';
import { UserRole } from './../auth/roles/user-role.enum';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileService } from './file.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from '../auth/roles/roles.decorator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Roles(UserRole.Admin, UserRole.Editor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.fileService.remove(+id);
    return;
  }

  @UseGuards(ThrottlerGuard, JwtAuthGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Throttle(5, 60 * 5)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('audio', FileService.audioFileInterceptorOptions),
  )
  async uploadFile(
    @UploadedFile() file: Express.MulterS3.File | Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        message: 'You need to provide a valid file.',
      });
    }

    const savedFileData = await this.fileService.saveFileData(file);

    return {
      ...savedFileData,
      url: savedFileData.url,
    };
  }
}
