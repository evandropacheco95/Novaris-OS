import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { FileRecord } from "@novaris/files";
import type { FileRecordRepository } from "@novaris/files";
import { Campaign } from "../../../../domain/aggregates/campaign/campaign.js";
import type { CampaignRepository } from "../../../../domain/repositories/campaign-repository.js";
import { AddAssetToCampaignHandler } from "../../../../application/handlers/add-asset-to-campaign/add-asset-to-campaign.handler.js";
import { AddAssetToCampaignCommand } from "../../../../application/commands/add-asset-to-campaign/add-asset-to-campaign.command.js";

class FakeCampaignRepository implements CampaignRepository {
  constructor(private readonly campaigns: Map<string, Campaign> = new Map()) {}
  add(campaign: Campaign): void {
    this.campaigns.set(campaign.id.toString(), campaign);
  }
  async findById(id: UniqueEntityId): Promise<Result<Option<Campaign>, InfrastructureError>> {
    const found = this.campaigns.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Campaign>());
  }
  async findAll(): Promise<Result<Campaign[], InfrastructureError>> {
    return Result.ok([...this.campaigns.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.campaigns.has(id.toString()));
  }
  async save(entity: Campaign): Promise<Result<void, InfrastructureError>> {
    this.campaigns.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.campaigns.delete(id.toString());
    return Result.ok(undefined);
  }
}

class FakeFileRecordRepository implements FileRecordRepository {
  constructor(private readonly files: Map<string, FileRecord> = new Map()) {}
  add(file: FileRecord): void {
    this.files.set(file.id.toString(), file);
  }
  async findById(id: UniqueEntityId): Promise<Result<Option<FileRecord>, InfrastructureError>> {
    const found = this.files.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<FileRecord>());
  }
  async findAll(): Promise<Result<FileRecord[], InfrastructureError>> {
    return Result.ok([...this.files.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.files.has(id.toString()));
  }
  async save(entity: FileRecord): Promise<Result<void, InfrastructureError>> {
    this.files.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.files.delete(id.toString());
    return Result.ok(undefined);
  }
}

function buildFileRecord(): FileRecord {
  return FileRecord.create({
    organizationId: new UniqueEntityId(),
    filename: "banner.png",
    mimeType: "image/png",
    sizeBytes: 1024,
    storagePath: "/tmp/banner.png",
  }).getValue()!;
}

describe("AddAssetToCampaignHandler", () => {
  it("associa um FileRecord real a uma Campaign real", async () => {
    const campaignRepository = new FakeCampaignRepository();
    const fileRecordRepository = new FakeFileRecordRepository();
    const handler = new AddAssetToCampaignHandler(campaignRepository, fileRecordRepository);

    const campaign = Campaign.create({ organizationId: new UniqueEntityId(), name: "Campanha" }).getValue()!;
    campaignRepository.add(campaign);
    const fileRecord = buildFileRecord();
    fileRecordRepository.add(fileRecord);

    const result = await handler.execute(new AddAssetToCampaignCommand({ campaignId: campaign.id.toString(), fileRecordId: fileRecord.id.toString() }));
    assert.equal(result.isSuccess, true);
    const updated = result.getValue()!;
    assert.equal(updated.getAssets().length, 1);
    assert.equal(updated.getAssets()[0]!.fileRecordId.equals(fileRecord.id), true);
  });

  it("devolve NotFoundError para campaignId inexistente", async () => {
    const campaignRepository = new FakeCampaignRepository();
    const fileRecordRepository = new FakeFileRecordRepository();
    const handler = new AddAssetToCampaignHandler(campaignRepository, fileRecordRepository);

    const fileRecord = buildFileRecord();
    fileRecordRepository.add(fileRecord);

    const result = await handler.execute(new AddAssetToCampaignCommand({ campaignId: new UniqueEntityId().toString(), fileRecordId: fileRecord.id.toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });

  it("devolve NotFoundError para fileRecordId inexistente", async () => {
    const campaignRepository = new FakeCampaignRepository();
    const fileRecordRepository = new FakeFileRecordRepository();
    const handler = new AddAssetToCampaignHandler(campaignRepository, fileRecordRepository);

    const campaign = Campaign.create({ organizationId: new UniqueEntityId(), name: "Campanha" }).getValue()!;
    campaignRepository.add(campaign);

    const result = await handler.execute(new AddAssetToCampaignCommand({ campaignId: campaign.id.toString(), fileRecordId: new UniqueEntityId().toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
