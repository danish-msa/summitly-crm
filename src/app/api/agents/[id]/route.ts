/**
 * API Route: /api/agents/[id]
 * Handles GET (get one), PUT (update), and DELETE operations
 * Using Prisma for cleaner, type-safe database operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

// GET - Get single agent by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get agent with Prisma (one line!)
    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
        },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch agent',
      },
      { status: 500 }
    );
  }
}

// PUT - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
        },
        { status: 404 }
      );
    }

    // Normalize field names
    const firstName = body.firstName || body.first_name;
    const lastName = body.lastName || body.last_name;

    // Update agent with Prisma (much cleaner!)
    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle || body.job_title || null }),
        ...(body.companyName !== undefined && { companyName: body.companyName || body.company_name || null }),
        ...(body.email && { email: body.email }),
        ...(body.emailOptOut !== undefined && { emailOptOut: body.emailOptOut }),
        ...(body.phone1 !== undefined && { phone1: body.phone1 || null }),
        ...(body.phone2 !== undefined && { phone2: body.phone2 || null }),
        ...(body.fax !== undefined && { fax: body.fax || null }),
        ...(body.address !== undefined && { address: body.address || null }),
        ...(body.city !== undefined && { city: body.city || null }),
        ...(body.state !== undefined && { state: body.state || null }),
        ...(body.country !== undefined && { country: body.country || null }),
        ...(body.zipCode !== undefined && { zipCode: body.zipCode || body.zip_code || null }),
        ...(body.deals !== undefined && { deals: body.deals ? (Array.isArray(body.deals) ? body.deals : [body.deals]) : [] }),
        ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null }),
        ...(body.reviews !== undefined && { reviews: body.reviews ? parseFloat(body.reviews) : null }),
        ...(body.owner !== undefined && { owner: body.owner || null }),
        ...(body.tags !== undefined && { tags: body.tags ? (Array.isArray(body.tags) ? body.tags : [body.tags]) : [] }),
        ...(body.source !== undefined && { source: body.source || null }),
        ...(body.industry !== undefined && { industry: body.industry || null }),
        ...(body.currency !== undefined && { currency: body.currency || null }),
        ...(body.language !== undefined && { language: body.language || null }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.status && { status: body.status }),
        ...(body.rating !== undefined && { rating: body.rating ? parseFloat(body.rating) : null }),
        ...(body.image !== undefined && { image: body.image || null }),
        // New Agent-Specific Fields
        ...(body.licenseNumber !== undefined && { licenseNumber: body.licenseNumber || body.license_number || null }),
        ...(body.licenseExpiryDate !== undefined && { licenseExpiryDate: body.licenseExpiryDate ? new Date(body.licenseExpiryDate) : null }),
        ...(body.brokerageStartDate !== undefined && { brokerageStartDate: body.brokerageStartDate ? new Date(body.brokerageStartDate) : null }),
        ...(body.teamOffice !== undefined && { teamOffice: body.teamOffice || body.team_office || null }),
        ...(body.commissionSplit !== undefined && { commissionSplit: body.commissionSplit || body.commission_split || null }),
        ...(body.bankingInfo !== undefined && { bankingInfo: body.bankingInfo || body.banking_info || null }),
        ...(body.emergencyContact !== undefined && { emergencyContact: body.emergencyContact || body.emergency_contact || null }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
    });
    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    
    // Handle unique constraint violation (duplicate email) - Prisma error code
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        {
          success: false,
          error: 'An agent with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update agent',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
        },
        { status: 404 }
      );
    }

    // Delete with Prisma (one line!)
    await prisma.agent.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete agent',
      },
      { status: 500 }
    );
  }
}
