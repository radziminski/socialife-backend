import { UploadProjectFileDto } from './dto/upload-project-file.dto';
import { RolesGuard } from './../auth/guards/user-roles.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FileService } from './../file/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from './../auth/types/index';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddProjectUserDto } from './dto/add-project-user.dto';
import { AddProjectFileDto } from './dto/add-project-file.dto';
import { ProjectUserGuard } from './guards/project-user.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/user-role.enum';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  //////////////////////////////////////
  ////////////// PROJECTS //////////////
  //////////////////////////////////////

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Get('all')
  getAll() {
    return this.projectService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllForUser(@Req() req: RequestWithUser) {
    return this.projectService.findAllForUser(req.user.email);
  }

  @UseGuards(JwtAuthGuard, ProjectUserGuard)
  @Get(':id')
  getOneIfProjectUser(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createWithProjectUser(
    @Req() req: RequestWithUser,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.createWithProjectUser({
      ...createProjectDto,
      email: req.user.email,
    });
  }

  @UseGuards(JwtAuthGuard, ProjectUserGuard)
  @Patch(':id')
  updateIfProjectUser(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @UseGuards(JwtAuthGuard, ProjectUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteIfProjectUser(@Param('id') id: string) {
    await this.projectService.remove(+id);
    return {};
  }

  //////////////////////////////////////
  /////////// PROJECT USERS ////////////
  //////////////////////////////////////

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Get(':id/users')
  getAllProjectUsers() {
    return this.projectService.findAllProjectUsers();
  }

  @UseGuards(JwtAuthGuard, ProjectUserGuard)
  @Post(':id/users')
  addProjectUser(
    @Param('id') id: string,
    @Body() addProjectUserDto: AddProjectUserDto,
  ) {
    return this.projectService.addProjectUser(+id, addProjectUserDto.email);
  }

  @UseGuards(JwtAuthGuard, ProjectUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/users/:userId')
  async deleteProjectUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.projectService.deleteProjectUser(+id, req.user.email, +userId);
    return;
  }

  //////////////////////////////////////
  /////////// PROJECT FILES ////////////
  //////////////////////////////////////

  @UseGuards(ThrottlerGuard, JwtAuthGuard, ProjectUserGuard)
  @Throttle(15, 60 * 10)
  @Post(':id/files/upload')
  @UseInterceptors(
    FileInterceptor('audio', FileService.audioFileInterceptorOptions),
  )
  async uploadFile(
    @UploadedFile() file: Express.MulterS3.File,
    @Param('id') id: string,
    @Body() body: UploadProjectFileDto,
  ) {
    const name = body['name'];

    if (!file) {
      throw new BadRequestException({
        message: 'You need to provide a valid file.',
      });
    }

    const savedFileData = await this.projectService.saveFileData(file, name);

    return this.projectService.addProjectFile(+id, savedFileData);
  }

  @UseGuards(JwtAuthGuard, ProjectUserGuard)
  @Post(':id/files')
  async addProjectFile(
    @Param('id') id: string,
    @Body() addProjectFileDto: AddProjectFileDto,
  ) {
    return this.projectService.addProjectFile(+id, addProjectFileDto.fileId);
  }

  @UseGuards(JwtAuthGuard, ProjectUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/files/:fileId')
  async deleteProjectFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    await this.projectService.deleteProjectFile(+id, +fileId);
    return;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Get(':id/files')
  getAllProjectFiles() {
    return this.projectService.findAllProjectFiles();
  }
}
