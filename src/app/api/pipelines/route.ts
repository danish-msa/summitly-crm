/**
 * API Route: /api/pipelines
 * Handles GET (list) and POST (create) operations for pipelines
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

/**
 * GET /api/pipelines
 * Get list of pipelines with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeStages = searchParams.get('includeStages') === 'true';
    const includeAccessUsers = searchParams.get('includeAccessUsers') === 'true';

    const where: any = {};
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    if (status) {
      where.status = status;
    }

    const [pipelines, total] = await Promise.all([
      prisma.pipeline.findMany({
        where,
        include: {
          stages: includeStages ? {
            orderBy: { order: 'asc' },
          } : false,
          accessUsers: includeAccessUsers || false,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.pipeline.count({ where }),
    ]);

    // Transform the data to include calculated fields
    const transformedPipelines = pipelines.map((pipeline: any) => ({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description || undefined,
      status: pipeline.status,
      accessType: pipeline.accessType,
      createdBy: pipeline.createdBy || undefined,
      createdAt: pipeline.createdAt.toISOString(),
      updatedAt: pipeline.updatedAt.toISOString(),
      stages: includeStages && pipeline.stages
        ? pipeline.stages.map((stage: any) => ({
            id: stage.id,
            pipelineId: stage.pipelineId,
            name: stage.name,
            order: stage.order,
            color: stage.color || undefined,
            createdAt: stage.createdAt.toISOString(),
            updatedAt: stage.updatedAt.toISOString(),
          }))
        : undefined,
      accessUsers: includeAccessUsers && pipeline.accessUsers
        ? pipeline.accessUsers.map((user: any) => ({
            id: user.id,
            pipelineId: user.pipelineId,
            userId: user.userId,
            userName: user.userName || undefined,
            userEmail: user.userEmail || undefined,
            createdAt: user.createdAt.toISOString(),
          }))
        : undefined,
      // TODO: Calculate totalDealValue and numberOfDeals from deals table
      totalDealValue: '$0',
      numberOfDeals: 0,
    }));

    return NextResponse.json({
      success: true,
      data: transformedPipelines,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching pipelines:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch pipelines',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pipelines
 * Create a new pipeline
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      status = 'Active',
      accessType = 'All',
      stages = [],
      accessUserIds = [],
      createdBy,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Pipeline name is required' },
        { status: 400 }
      );
    }

    // Create pipeline with stages and access users in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the pipeline
      const pipeline = await tx.pipeline.create({
        data: {
          name: name.trim(),
          description: description || null,
          status,
          accessType,
          createdBy: createdBy || null,
        },
      });

      // Create stages if provided
      if (stages.length > 0) {
        await tx.pipelineStage.createMany({
          data: stages.map((stage: any, index: number) => ({
            pipelineId: pipeline.id,
            name: stage.name,
            order: stage.order !== undefined ? stage.order : index,
            color: stage.color || null,
          })),
        });
      }

      // Create access users if accessType is 'Selected' and user IDs are provided
      if (accessType === 'Selected' && accessUserIds.length > 0) {
        // Note: You'll need to fetch user details from your user service
        // For now, we'll just store the user IDs
        await tx.pipelineAccessUser.createMany({
          data: accessUserIds.map((userId: string) => ({
            pipelineId: pipeline.id,
            userId,
            userName: null, // TODO: Fetch from user service
            userEmail: null, // TODO: Fetch from user service
          })),
        });
      }

      // Fetch the complete pipeline with relations
      return await tx.pipeline.findUnique({
        where: { id: pipeline.id },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
          accessUsers: true,
        },
      });
    });

    const transformedPipeline = {
      id: result.id,
      name: result.name,
      description: result.description || undefined,
      status: result.status,
      accessType: result.accessType,
      createdBy: result.createdBy || undefined,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      stages: result.stages.map((stage: any) => ({
        id: stage.id,
        pipelineId: stage.pipelineId,
        name: stage.name,
        order: stage.order,
        color: stage.color || undefined,
        createdAt: stage.createdAt.toISOString(),
        updatedAt: stage.updatedAt.toISOString(),
      })),
      accessUsers: result.accessUsers.map((user: any) => ({
        id: user.id,
        pipelineId: user.pipelineId,
        userId: user.userId,
        userName: user.userName || undefined,
        userEmail: user.userEmail || undefined,
        createdAt: user.createdAt.toISOString(),
      })),
      totalDealValue: '$0',
      numberOfDeals: 0,
    };

    return NextResponse.json({
      success: true,
      data: transformedPipeline,
      message: 'Pipeline created successfully',
    });
  } catch (error: any) {
    console.error('Error creating pipeline:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create pipeline',
      },
      { status: 500 }
    );
  }
}
