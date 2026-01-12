import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import {
  AssetNotFoundException,
  AssetAlreadyExistsException,
  AssetServiceException,
} from "./exceptions/custom-exceptions";

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    try {
      const existingAsset = await this.prisma.assets.findUnique({
        where: { symbol: createAssetDto.symbol.toUpperCase() },
      });

      if (existingAsset) {
        throw new AssetAlreadyExistsException(createAssetDto.symbol);
      }

      const asset = await this.prisma.assets.create({
        data: {
          ...createAssetDto,
          symbol: createAssetDto.symbol.toUpperCase(),
        },
      });

      return {
        ...asset,
        price: parseFloat((asset as any).price.toString()),
      };
    } catch (error) {
      if (error instanceof AssetAlreadyExistsException) {
        throw error;
      }
      throw new AssetServiceException("Failed to create asset", error);
    }
  }

  async findAll() {
    try {
      const assets = await this.prisma.assets.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      return assets.map((asset) => ({
        ...asset,
        price: parseFloat((asset as any).price.toString()),
      }));
    } catch (error) {
      throw new AssetServiceException("Failed to fetch assets", error);
    }
  }

  async findOne(id: number) {
    try {
      if (!this.isValidId(id)) {
        throw new BadRequestException("ID must be a positive number");
      }

      const asset = await this.prisma.assets.findUnique({
        where: { id },
      });

      if (!asset) {
        throw new AssetNotFoundException(id);
      }

      return {
        ...asset,
        price: parseFloat((asset as any).price.toString()),
      };
    } catch (error) {
      if (
        error instanceof AssetNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new AssetServiceException("Failed to fetch asset", error);
    }
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    try {
      if (!this.isValidId(id)) {
        throw new BadRequestException("ID must be a positive number");
      }

      if (Object.keys(updateAssetDto).length === 0) {
        throw new BadRequestException(
          "At least one field must be provided for update"
        );
      }

      await this.findOne(id);

      if (updateAssetDto.symbol) {
        const existingAsset = await this.prisma.assets.findFirst({
          where: {
            symbol: updateAssetDto.symbol.toUpperCase(),
            id: { not: id },
          },
        });

        if (existingAsset) {
          throw new AssetAlreadyExistsException(updateAssetDto.symbol);
        }
      }

      const asset = await this.prisma.assets.update({
        where: { id },
        data: {
          ...updateAssetDto,
          symbol: updateAssetDto.symbol?.toUpperCase(),
        },
      });

      return {
        ...asset,
        price: parseFloat((asset as any).price.toString()),
      };
    } catch (error) {
      if (
        error instanceof AssetNotFoundException ||
        error instanceof AssetAlreadyExistsException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new AssetServiceException("Failed to update asset", error);
    }
  }

  async remove(id: number) {
    try {
      if (!this.isValidId(id)) {
        throw new BadRequestException("ID must be a positive number");
      }

      await this.findOne(id);

      await this.prisma.assets.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (
        error instanceof AssetNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new AssetServiceException("Failed to remove asset", error);
    }
  }

  private isValidId(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  }
}
