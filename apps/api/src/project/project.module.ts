import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createProjectRepository, CreateProjectHandler, AddTaskHandler, UpdateTaskStatusHandler } from "@novaris/projects";
import { AuthModule } from "../auth/auth.module.js";
import { ProjectController } from "./project.controller.js";

const PROJECT_REPOSITORY = "PROJECT_REPOSITORY";

/** ProjectModule — Composition Root do Project Domain (`ENG-0129`). */
@Module({
  imports: [AuthModule],
  controllers: [ProjectController],
  providers: [
    { provide: PROJECT_REPOSITORY, useFactory: () => createProjectRepository(prisma) },
    {
      provide: CreateProjectHandler,
      useFactory: (repository: ReturnType<typeof createProjectRepository>) => new CreateProjectHandler(repository),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: AddTaskHandler,
      useFactory: (repository: ReturnType<typeof createProjectRepository>) => new AddTaskHandler(repository),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: UpdateTaskStatusHandler,
      useFactory: (repository: ReturnType<typeof createProjectRepository>) => new UpdateTaskStatusHandler(repository),
      inject: [PROJECT_REPOSITORY],
    },
    { provide: "ProjectRepository", useExisting: PROJECT_REPOSITORY },
  ],
})
export class ProjectModule {}
