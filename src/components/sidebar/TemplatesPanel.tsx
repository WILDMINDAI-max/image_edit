'use client';

import { useState } from 'react';
import { Search, Layout } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { CanvasElement, TextElement, ShapeElement, ImageElement } from '@/types/canvas';
import { PageBackground } from '@/types/project';
import { loadGoogleFont, GOOGLE_FONTS } from '@/services/googleFonts';

// Template interface
interface TemplateData {
    id: string;
    name: string;
    category: string;
    thumbnail?: string;
    width: number;
    height: number;
    background: PageBackground;
    elements: Partial<CanvasElement>[];
}

// Sample templates with actual editable elements
const TEMPLATES: TemplateData[] = [
    {
        id: 'price-list-1',
        name: 'Price List',
        category: 'Business',
        width: 1080,
        height: 1350,
        background: { type: 'solid', color: '#F5F0E8' },
        elements: [
            // Header background
            {
                type: 'shape',
                name: 'Header BG',
                shapeType: 'rectangle',
                transform: { x: 540, y: 100, width: 1080, height: 200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Title
            {
                type: 'text',
                name: 'Title',
                content: 'PRICE LIST',
                transform: { x: 540, y: 80, width: 400, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 48, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Subtitle
            {
                type: 'text',
                name: 'Subtitle',
                content: 'Luxury Spa & Wellness',
                transform: { x: 540, y: 130, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A962', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Divider line
            {
                type: 'shape',
                name: 'Divider',
                shapeType: 'rectangle',
                transform: { x: 540, y: 250, width: 900, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A962', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            // Service Category 1
            {
                type: 'text',
                name: 'Category 1',
                content: 'MASSAGE THERAPY',
                transform: { x: 540, y: 300, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 12,
            } as Partial<TextElement>,
            // Service 1
            {
                type: 'text',
                name: 'Service 1',
                content: 'Swedish Massage',
                transform: { x: 300, y: 360, width: 300, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4A4A4A', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 13,
            } as Partial<TextElement>,
            // Price 1
            {
                type: 'text',
                name: 'Price 1',
                content: '$85',
                transform: { x: 780, y: 360, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'right', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 14,
            } as Partial<TextElement>,
            // Service 2
            {
                type: 'text',
                name: 'Service 2',
                content: 'Deep Tissue Massage',
                transform: { x: 300, y: 400, width: 300, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4A4A4A', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 15,
            } as Partial<TextElement>,
            // Price 2
            {
                type: 'text',
                name: 'Price 2',
                content: '$95',
                transform: { x: 780, y: 400, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'right', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 16,
            } as Partial<TextElement>,
            // Service 3
            {
                type: 'text',
                name: 'Service 3',
                content: 'Hot Stone Therapy',
                transform: { x: 300, y: 440, width: 300, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4A4A4A', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 17,
            } as Partial<TextElement>,
            // Price 3
            {
                type: 'text',
                name: 'Price 3',
                content: '$120',
                transform: { x: 780, y: 440, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'right', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 18,
            } as Partial<TextElement>,
            // Divider 2
            {
                type: 'shape',
                name: 'Divider 2',
                shapeType: 'rectangle',
                transform: { x: 540, y: 500, width: 900, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A962', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            // Service Category 2
            {
                type: 'text',
                name: 'Category 2',
                content: 'FACIAL TREATMENTS',
                transform: { x: 540, y: 550, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 19,
            } as Partial<TextElement>,
            // Service 4
            {
                type: 'text',
                name: 'Service 4',
                content: 'Classic Facial',
                transform: { x: 300, y: 610, width: 300, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4A4A4A', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 20,
            } as Partial<TextElement>,
            // Price 4
            {
                type: 'text',
                name: 'Price 4',
                content: '$75',
                transform: { x: 780, y: 610, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'right', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 21,
            } as Partial<TextElement>,
            // Service 5
            {
                type: 'text',
                name: 'Service 5',
                content: 'Anti-Aging Treatment',
                transform: { x: 300, y: 650, width: 300, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4A4A4A', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 22,
            } as Partial<TextElement>,
            // Price 5
            {
                type: 'text',
                name: 'Price 5',
                content: '$150',
                transform: { x: 780, y: 650, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'right', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 23,
            } as Partial<TextElement>,
            // Footer with contact
            {
                type: 'text',
                name: 'Contact',
                content: 'Book Now: +1 (555) 123-4567 | www.luxuryspa.com',
                transform: { x: 540, y: 1300, width: 600, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D4A3E', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 24,
            } as Partial<TextElement>,
            // Decorative corner element
            {
                type: 'shape',
                name: 'Corner Accent',
                shapeType: 'rectangle',
                transform: { x: 100, y: 100, width: 60, height: 60, rotation: 45, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A962', stroke: null, strokeWidth: 0, opacity: 0.8 },
                zIndex: 2,
            } as Partial<ShapeElement>,
        ],
    },
    // Pricing Table Template (converted from Elementor)
    {
        id: 'pricing-table-1',
        name: 'Pricing Table',
        category: 'Business',
        width: 1200,
        height: 800,
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [
            // === BASIC PLAN (Left Card) ===
            // Card Background
            {
                type: 'shape',
                name: 'Basic Card BG',
                shapeType: 'rectangle',
                transform: { x: 220, y: 400, width: 320, height: 550, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F3E8EE', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Basic Header
            {
                type: 'shape',
                name: 'Basic Header BG',
                shapeType: 'rectangle',
                transform: { x: 220, y: 190, width: 320, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4ECDC4', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Basic Title
            {
                type: 'text',
                name: 'Basic Title',
                content: 'Basic',
                transform: { x: 220, y: 190, width: 280, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 32, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Basic Price
            {
                type: 'text',
                name: 'Basic Price',
                content: '$0/mo',
                transform: { x: 220, y: 280, width: 280, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A535C', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 46, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Basic Description
            {
                type: 'text',
                name: 'Basic Desc',
                content: 'Suitable for beginners',
                transform: { x: 220, y: 330, width: 280, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#666666', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 400, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,
            // Basic Features
            {
                type: 'text',
                name: 'Basic Features',
                content: '✓ 2 GB Storage\n✓ 10 Accounts\n✓ 50 GB Bandwidth\n✓ 24/7 Support',
                transform: { x: 220, y: 440, width: 260, height: 140, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.8, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 13,
            } as Partial<TextElement>,
            // Basic CTA Button BG
            {
                type: 'shape',
                name: 'Basic CTA BG',
                shapeType: 'rectangle',
                transform: { x: 220, y: 580, width: 200, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4ECDC4', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 14,
            } as Partial<ShapeElement>,
            // Basic CTA Text
            {
                type: 'text',
                name: 'Basic CTA',
                content: 'Choose Plan',
                transform: { x: 220, y: 580, width: 180, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 15,
            } as Partial<TextElement>,

            // === STANDARD PLAN (Center Card - Larger) ===
            // Card Background
            {
                type: 'shape',
                name: 'Standard Card BG',
                shapeType: 'rectangle',
                transform: { x: 600, y: 400, width: 340, height: 620, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F3E8EE', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            // Standard Header
            {
                type: 'shape',
                name: 'Standard Header BG',
                shapeType: 'rectangle',
                transform: { x: 600, y: 160, width: 340, height: 110, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A535C', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,
            // Standard Title
            {
                type: 'text',
                name: 'Standard Title',
                content: 'Standard',
                transform: { x: 600, y: 160, width: 300, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 34, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 20,
            } as Partial<TextElement>,
            // Standard Price
            {
                type: 'text',
                name: 'Standard Price',
                content: '$49/mo',
                transform: { x: 600, y: 260, width: 300, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A535C', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 48, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 21,
            } as Partial<TextElement>,
            // Standard Description
            {
                type: 'text',
                name: 'Standard Desc',
                content: 'Best for growing teams',
                transform: { x: 600, y: 315, width: 300, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#666666', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 400, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 22,
            } as Partial<TextElement>,
            // Standard Features
            {
                type: 'text',
                name: 'Standard Features',
                content: '✓ 20 GB Storage\n✓ 50 Accounts\n✓ 200 GB Bandwidth\n✓ 24/7 Priority Support',
                transform: { x: 600, y: 430, width: 280, height: 140, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 17, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.8, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 23,
            } as Partial<TextElement>,
            // Standard CTA BG
            {
                type: 'shape',
                name: 'Standard CTA BG',
                shapeType: 'rectangle',
                transform: { x: 600, y: 580, width: 220, height: 55, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A535C', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 24,
            } as Partial<ShapeElement>,
            // Standard CTA Text
            {
                type: 'text',
                name: 'Standard CTA',
                content: 'Choose Plan',
                transform: { x: 600, y: 580, width: 200, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 20, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 25,
            } as Partial<TextElement>,

            // === PREMIUM PLAN (Right Card) ===
            // Card Background
            {
                type: 'shape',
                name: 'Premium Card BG',
                shapeType: 'rectangle',
                transform: { x: 980, y: 400, width: 320, height: 550, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F3E8EE', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Premium Header
            {
                type: 'shape',
                name: 'Premium Header BG',
                shapeType: 'rectangle',
                transform: { x: 980, y: 190, width: 320, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF6B6B', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Premium Title
            {
                type: 'text',
                name: 'Premium Title',
                content: 'Premium',
                transform: { x: 980, y: 190, width: 280, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 32, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 30,
            } as Partial<TextElement>,
            // Premium Price
            {
                type: 'text',
                name: 'Premium Price',
                content: '$99/mo',
                transform: { x: 980, y: 280, width: 280, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF6B6B', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 46, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 31,
            } as Partial<TextElement>,
            // Premium Description
            {
                type: 'text',
                name: 'Premium Desc',
                content: 'For enterprise teams',
                transform: { x: 980, y: 330, width: 280, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#666666', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 400, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 32,
            } as Partial<TextElement>,
            // Premium Features
            {
                type: 'text',
                name: 'Premium Features',
                content: '✓ Unlimited Storage\n✓ Unlimited Accounts\n✓ Unlimited Bandwidth\n✓ Dedicated Support',
                transform: { x: 980, y: 440, width: 260, height: 140, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.8, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 33,
            } as Partial<TextElement>,
            // Premium CTA BG
            {
                type: 'shape',
                name: 'Premium CTA BG',
                shapeType: 'rectangle',
                transform: { x: 980, y: 580, width: 200, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF6B6B', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 34,
            } as Partial<ShapeElement>,
            // Premium CTA Text
            {
                type: 'text',
                name: 'Premium CTA',
                content: 'Choose Plan',
                transform: { x: 980, y: 580, width: 180, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 35,
            } as Partial<TextElement>,
        ],
    },
    // Doctor Profile Template (converted from Elementor)
    {
        id: 'doctor-profile-1',
        name: 'Doctor Profile',
        category: 'Medical',
        width: 1080,
        height: 1920,
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [
            // === HEADER SECTION ===
            // Hospital Background Image Placeholder
            {
                type: 'shape',
                name: 'Hospital BG',
                shapeType: 'rectangle',
                transform: { x: 540, y: 200, width: 1080, height: 400, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#E8F4F8', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Logo Placeholder
            {
                type: 'shape',
                name: 'Logo Area',
                shapeType: 'circle',
                transform: { x: 100, y: 80, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#EC0D64', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            // Search Bar Background
            {
                type: 'shape',
                name: 'Search Bar BG',
                shapeType: 'rectangle',
                transform: { x: 540, y: 80, width: 500, height: 45, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F5F5F5', stroke: '#CCCCCC', strokeWidth: 1, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,
            // Search Placeholder Text
            {
                type: 'text',
                name: 'Search Text',
                content: 'Search here...',
                transform: { x: 540, y: 80, width: 480, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#999999', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 6,
            } as Partial<TextElement>,

            // === DOCTOR PROFILE SECTION ===
            // Doctor Profile Picture (Circle)
            {
                type: 'shape',
                name: 'Doctor Photo BG',
                shapeType: 'circle',
                transform: { x: 200, y: 450, width: 280, height: 280, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2CA8D2', stroke: '#000000', strokeWidth: 2, opacity: 1 },
                zIndex: 10,
            } as Partial<ShapeElement>,
            // Profile Stats Section
            {
                type: 'text',
                name: 'Followers Label',
                content: 'Followers',
                transform: { x: 450, y: 420, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#02BAF1', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Followers Count',
                content: '60k',
                transform: { x: 450, y: 450, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 17, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Following Label',
                content: 'Following',
                transform: { x: 560, y: 420, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#02BAF1', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 13,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Following Count',
                content: '10k',
                transform: { x: 560, y: 450, width: 100, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 17, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 14,
            } as Partial<TextElement>,

            // === ACTION BUTTONS ===
            // Chat Now Button BG
            {
                type: 'shape',
                name: 'Chat Now BG',
                shapeType: 'rectangle',
                transform: { x: 720, y: 435, width: 140, height: 45, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#EC0D64', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 15,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Chat Now Text',
                content: 'Chat Now',
                transform: { x: 720, y: 435, width: 120, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 16,
            } as Partial<TextElement>,
            // Follow Button BG
            {
                type: 'shape',
                name: 'Follow BG',
                shapeType: 'rectangle',
                transform: { x: 880, y: 435, width: 120, height: 45, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#EC0D64', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 17,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Follow Text',
                content: 'Follow',
                transform: { x: 880, y: 435, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 18,
            } as Partial<TextElement>,

            // === DOCTOR INFO SECTION ===
            // Doctor Name
            {
                type: 'text',
                name: 'Doctor Name',
                content: 'Dr. Cape Fernand',
                transform: { x: 300, y: 650, width: 400, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A1A1A', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 36, fontWeight: 700, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 20,
            } as Partial<TextElement>,
            // Specialty Tag 1
            {
                type: 'shape',
                name: 'Tag 1 BG',
                shapeType: 'rectangle',
                transform: { x: 180, y: 710, width: 140, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: '#EC0D64', strokeWidth: 1, opacity: 1 },
                zIndex: 21,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Tag 1 Text',
                content: 'Arthroscopy',
                transform: { x: 180, y: 710, width: 120, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A1A1A', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 22,
            } as Partial<TextElement>,
            // Specialty Tag 2
            {
                type: 'shape',
                name: 'Tag 2 BG',
                shapeType: 'rectangle',
                transform: { x: 350, y: 710, width: 150, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: '#EC0D64', strokeWidth: 1, opacity: 1 },
                zIndex: 23,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Tag 2 Text',
                content: 'Spine Surgery',
                transform: { x: 350, y: 710, width: 130, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A1A1A', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 24,
            } as Partial<TextElement>,
            // Bio Description
            {
                type: 'text',
                name: 'Bio Text',
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
                transform: { x: 300, y: 790, width: 500, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#666666', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.6, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 25,
            } as Partial<TextElement>,

            // === SERVICES SECTION ===
            // Services Header
            {
                type: 'text',
                name: 'Services Header',
                content: 'Services',
                transform: { x: 780, y: 650, width: 200, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A1A1A', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 24, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 30,
            } as Partial<TextElement>,
            // Services List BG
            {
                type: 'shape',
                name: 'Services List BG',
                shapeType: 'rectangle',
                transform: { x: 780, y: 760, width: 400, height: 160, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F8F8F8', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 31,
            } as Partial<ShapeElement>,
            // Services List Items
            {
                type: 'text',
                name: 'Services List',
                content: '• Joint Replacement\n• Arthroscopy\n• Fracture Care\n• Pediatric Orthopedics\n• Sports Medicine',
                transform: { x: 780, y: 760, width: 380, height: 140, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.8, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 32,
            } as Partial<TextElement>,

            // === CTA SECTION ===
            // Online Consultation Button BG
            {
                type: 'shape',
                name: 'CTA BG',
                shapeType: 'rectangle',
                transform: { x: 540, y: 950, width: 350, height: 55, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#EC0D64', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 40,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'CTA Text',
                content: 'Click for Online Consultation',
                transform: { x: 540, y: 950, width: 320, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 41,
            } as Partial<TextElement>,

            // === MAP SECTION ===
            // Map Placeholder
            {
                type: 'shape',
                name: 'Map Placeholder',
                shapeType: 'rectangle',
                transform: { x: 780, y: 1100, width: 400, height: 250, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#E0E0E0', stroke: '#CCCCCC', strokeWidth: 1, opacity: 1 },
                zIndex: 45,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Map Label',
                content: '📍 London, United Kingdom',
                transform: { x: 780, y: 1100, width: 300, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#666666', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 46,
            } as Partial<TextElement>,

            // === LIKES & REVIEWS SECTION ===
            {
                type: 'text',
                name: 'Likes Label',
                content: '❤️ Likes',
                transform: { x: 980, y: 500, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 17, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 50,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Reviews Label',
                content: '⭐ Reviews',
                transform: { x: 980, y: 540, width: 100, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#333333', opacity: 1 },
                textStyle: { fontFamily: 'Roboto', fontSize: 17, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 51,
            } as Partial<TextElement>,
        ],
    },
    // Food Blog Template (exported from editor)
    {
        id: 'food-blog-1',
        name: 'Food Blog',
        category: 'Blog',
        width: 1280,
        height: 720,
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [
            // Food Background Image
            {
                type: 'image',
                name: 'Food Background',
                src: 'https://images.unsplash.com/photo-1541809354-0f0cfe132960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTY5OTZ8MHwxfHNlYXJjaHw0MHx8Zm9vZCUyMGZsYXQlMjBsYXl8ZW58MHx8fHwxNjM1MDUzNjA3&ixlib=rb-1.2.1&q=80&w=1080',
                transform: { x: 640, y: 360, width: 1080, height: 810, scaleX: 1.185, scaleY: 1.185, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: null, strokeWidth: 0, opacity: 1 },
                filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false, sepia: false, invert: false },
                isBackground: true,
                zIndex: 0,
            } as Partial<ImageElement>,
            // Overlay Rectangle
            {
                type: 'shape',
                name: 'Overlay Rect',
                shapeType: 'rectangle',
                transform: { x: 628, y: 314, width: 1351, height: 304, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#9CF3DF', stroke: null, strokeWidth: 0, opacity: 0.5 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Welcome Text
            {
                type: 'text',
                name: 'Welcome Text',
                content: 'Welcome',
                transform: { x: 630, y: 271, width: 862, height: 195, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: '#000000', strokeWidth: 7, opacity: 1 },
                textStyle: { fontFamily: 'Zhi Mang Xing', fontSize: 173, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                effect: { type: 'none' },
                zIndex: 3,
            } as Partial<TextElement>,
            // Blog Title
            {
                type: 'text',
                name: 'Blog Title',
                content: 'OUR FOOD BLOG',
                transform: { x: 650, y: 407, width: 850, height: 116, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#000000', stroke: null, strokeWidth: 0, opacity: 1 },
                textStyle: { fontFamily: 'Caveat Brush', fontSize: 103, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                effect: { type: 'none' },
                zIndex: 4,
            } as Partial<TextElement>,
        ],
    },
    // Cardio Fitness Template (exported from editor)
    {
        id: 'cardio-fitness-1',
        name: 'Cardio Fitness',
        category: 'Fitness',
        width: 1280,
        height: 720,
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [
            // Workout Background Image
            {
                type: 'image',
                name: 'Workout Background',
                src: 'https://images.unsplash.com/photo-1614928228253-dc09cbc3b11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTY5OTZ8MHwxfHNlYXJjaHwxMTV8fHdvcmtvdXR8ZW58MHx8fHwxNjM2NDYxNjA5&ixlib=rb-1.2.1&q=80&w=1080',
                transform: { x: 758, y: 359, width: 1080, height: 720, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: null, strokeWidth: 0, opacity: 1 },
                filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false, sepia: false, invert: false },
                isBackground: true,
                zIndex: 1,
            } as Partial<ImageElement>,
            // Hexagon BG 1 (golden pointed hexagon)
            {
                type: 'shape',
                name: 'Hexagon BG 1',
                shapeType: 'pointed-hexagon',
                transform: { x: 161, y: 365, width: 90, height: 90, scaleX: 6.02, scaleY: 10.42, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#C4AD1E', stroke: null, strokeWidth: 0, opacity: 0.94 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Hexagon BG 2 (semi-transparent golden)
            {
                type: 'shape',
                name: 'Hexagon BG 2',
                shapeType: 'pointed-hexagon',
                transform: { x: 111, y: 367, width: 90, height: 90, scaleX: 10.89, scaleY: 10.89, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#C4AD1E', stroke: null, strokeWidth: 0, opacity: 0.55 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Title Bar BG (white rectangle)
            {
                type: 'shape',
                name: 'Title Bar BG',
                shapeType: 'rectangle',
                transform: { x: 321.1132072755644, y: 230.8113252211165, width: 388, height: 77, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            // 10 Minutes Text
            {
                type: 'text',
                name: '10 Minutes Text',
                content: '10 minutes fitness',
                transform: { x: 351.1132072755644, y: 233.81132522111645, width: 450, height: 63.28, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#000000', stroke: null, strokeWidth: 0, opacity: 1 },
                textStyle: { fontFamily: 'Bebas Neue', fontSize: 56, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                effect: { type: 'none' },
                zIndex: 4,
            } as Partial<TextElement>,
            // CARDIO Text (large)
            {
                type: 'text',
                name: 'Cardio Text',
                content: 'CARDIO',
                transform: { x: 460.3494532079619, y: 360, width: 886.2303963476114, height: 226, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                textStyle: { fontFamily: 'Bebas Neue', fontSize: 200, fontWeight: 800, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                effect: { type: 'none' },
                zIndex: 5,
            } as Partial<TextElement>,
            // Beginner Text
            {
                type: 'text',
                name: 'Beginner Text',
                content: 'exercise for beginner',
                transform: { x: 298.2264145511288, y: 459.8679257354369, width: 358, height: 46.33, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', stroke: null, strokeWidth: 0, opacity: 1 },
                textStyle: { fontFamily: 'Bebas Neue', fontSize: 41, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                effect: { type: 'none' },
                zIndex: 6,
            } as Partial<TextElement>,
            // Subscribe BG (golden rectangle)
            {
                type: 'shape',
                name: 'Subscribe BG',
                shapeType: 'rectangle',
                transform: { x: 1057, y: 600, width: 296, height: 57, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#C4AD1E', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 7,
            } as Partial<ShapeElement>,
            // Subscribe Text
            {
                type: 'text',
                name: 'Subscribe Text',
                content: 'watch & subscribe',
                transform: { x: 1091, y: 602, width: 327, height: 46.33, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                textStyle: { fontFamily: 'Bebas Neue', fontSize: 41, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                effect: { type: 'none' },
                zIndex: 8,
            } as Partial<TextElement>,
        ],
    },
    // ================== NEW STYLISH TEMPLATES ==================
    // Tech Startup Pitch Template
    {
        id: 'tech-startup-pitch',
        name: 'Tech Startup Pitch',
        category: 'Business',
        width: 1920,
        height: 1080,
        background: {
            type: 'gradient',
            gradientType: 'linear',
            angle: 45,
            colorStops: [
                { offset: 0, color: '#667EEA' },
                { offset: 1, color: '#764BA2' }
            ]
        },
        elements: [
            // Abstract shapes decoration
            {
                type: 'shape',
                name: 'Abstract Circle 1',
                shapeType: 'circle',
                transform: { x: 1700, y: 200, width: 300, height: 300, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 0.1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Abstract Circle 2',
                shapeType: 'circle',
                transform: { x: 200, y: 850, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 0.08 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Company Name
            {
                type: 'text',
                name: 'Company',
                content: 'NEXAFLOW',
                transform: { x: 540, y: 280, width: 700, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 72, fontWeight: 700, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 5, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Tagline
            {
                type: 'text',
                name: 'Tagline',
                content: 'AI-Powered Workflow Automation',
                transform: { x: 440, y: 370, width: 600, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.9 },
                textStyle: { fontFamily: 'Poppins', fontSize: 24, fontWeight: 300, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Key Stats Box 1
            {
                type: 'shape',
                name: 'Stat Box 1',
                shapeType: 'rectangle',
                transform: { x: 280, y: 600, width: 280, height: 200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 0.15 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Stat 1 Number',
                content: '$50M+',
                transform: { x: 280, y: 570, width: 240, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 48, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Stat 1 Label',
                content: 'Total Funding',
                transform: { x: 280, y: 630, width: 200, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.8 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 13,
            } as Partial<TextElement>,
            // Key Stats Box 2
            {
                type: 'shape',
                name: 'Stat Box 2',
                shapeType: 'rectangle',
                transform: { x: 600, y: 600, width: 280, height: 200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 0.15 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Stat 2 Number',
                content: '500K+',
                transform: { x: 600, y: 570, width: 240, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 48, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 14,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Stat 2 Label',
                content: 'Active Users',
                transform: { x: 600, y: 630, width: 200, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.8 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 15,
            } as Partial<TextElement>,
            // Right side - Dashboard placeholder
            {
                type: 'shape',
                name: 'Dashboard Preview',
                shapeType: 'rectangle',
                transform: { x: 1400, y: 540, width: 800, height: 600, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 0.1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Dashboard Label',
                content: 'Dashboard Preview',
                transform: { x: 1400, y: 540, width: 300, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.5 },
                textStyle: { fontFamily: 'Poppins', fontSize: 20, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 16,
            } as Partial<TextElement>,
            // Footer
            {
                type: 'text',
                name: 'Website',
                content: 'nexaflow.io',
                transform: { x: 280, y: 950, width: 200, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.8 },
                textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 500, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 20,
            } as Partial<TextElement>,
        ],
    },
    // Lifestyle Quote Template
    {
        id: 'lifestyle-quote',
        name: 'Lifestyle Quote',
        category: 'Social Media',
        width: 1080,
        height: 1080,
        background: {
            type: 'gradient',
            gradientType: 'radial',
            radialPosition: 'center',
            colorStops: [
                { offset: 0, color: '#FED9B7' },
                { offset: 1, color: '#F07167' }
            ]
        },
        elements: [
            // Decorative quotation mark
            {
                type: 'text',
                name: 'Quote Mark',
                content: '"',
                transform: { x: 200, y: 300, width: 300, height: 400, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.2 },
                textStyle: { fontFamily: 'Georgia', fontSize: 400, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 1,
            } as Partial<TextElement>,
            // Main Quote
            {
                type: 'text',
                name: 'Quote',
                content: 'The only way to do great work is to love what you do.',
                transform: { x: 540, y: 480, width: 800, height: 200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 52, fontWeight: 600, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Divider
            {
                type: 'shape',
                name: 'Divider',
                shapeType: 'rectangle',
                transform: { x: 540, y: 620, width: 100, height: 3, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 0.8 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            // Author
            {
                type: 'text',
                name: 'Author',
                content: '— Steve Jobs',
                transform: { x: 540, y: 700, width: 400, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.9 },
                textStyle: { fontFamily: 'Poppins', fontSize: 24, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Hashtag
            {
                type: 'text',
                name: 'Hashtag',
                content: '#motivation #inspiration',
                transform: { x: 540, y: 950, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.7 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,
        ],
    },
];

export function TemplatesPanel() {
    const [searchQuery, setSearchQuery] = useState('');
    const addElement = useCanvasStore((state) => state.addElement);
    const updatePage = useEditorStore((state) => state.updatePage);
    const project = useEditorStore((state) => state.project);

    // Create a complete element with all required fields
    const createCompleteElement = (partial: Partial<CanvasElement>, index: number): CanvasElement => {
        const baseTransform = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0,
            originX: 'center' as const,
            originY: 'center' as const,
            ...partial.transform,
        };

        const baseStyle = {
            fill: '#000000',
            stroke: null,
            strokeWidth: 0,
            opacity: 1,
            shadow: null,
            cornerRadius: 0,
            ...partial.style,
        };

        const baseElement = {
            id: crypto.randomUUID(),
            name: partial.name || `Element ${index + 1}`,
            locked: false,
            visible: true,
            selectable: true,
            zIndex: partial.zIndex || (index + 1),
            transform: baseTransform,
            style: baseStyle,
        };

        if (partial.type === 'text') {
            const textPartial = partial as Partial<TextElement>;
            return {
                ...baseElement,
                type: 'text',
                content: textPartial.content || 'Text',
                editable: true,
                textStyle: {
                    fontFamily: 'Poppins',
                    fontSize: 24,
                    fontWeight: 400,
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    letterSpacing: 0,
                    textTransform: 'none',
                    ...textPartial.textStyle,
                },
                effect: textPartial.effect || { type: 'none' },
            } as TextElement;
        }

        if (partial.type === 'shape') {
            const shapePartial = partial as Partial<ShapeElement>;
            return {
                ...baseElement,
                type: 'shape',
                shapeType: shapePartial.shapeType || 'rectangle',
                points: shapePartial.points,
            } as ShapeElement;
        }

        if (partial.type === 'image') {
            const imagePartial = partial as Partial<ImageElement>;
            return {
                ...baseElement,
                type: 'image',
                src: imagePartial.src || '',
                originalSrc: imagePartial.originalSrc || imagePartial.src || '',
                filters: {
                    brightness: 0,
                    contrast: 0,
                    saturation: 0,
                    blur: 0,
                    temperature: 0,
                    tint: 0,
                    highlights: 0,
                    shadows: 0,
                    whites: 0,
                    blacks: 0,
                    vibrance: 0,
                    clarity: 0,
                    sharpness: 0,
                    vignette: 0,
                    grayscale: false,
                    sepia: false,
                    invert: false,
                    filterPreset: null,
                    ...imagePartial.filters,
                },
                crop: imagePartial.crop || null,
                colorReplace: imagePartial.colorReplace || null,
                crossOrigin: 'anonymous',
                isBackground: imagePartial.isBackground || false,
                blendMode: 'normal',
            } as ImageElement;
        }

        // Default fallback
        return {
            ...baseElement,
            type: partial.type || 'shape',
        } as CanvasElement;
    };

    // Load template onto canvas
    const loadTemplate = async (template: TemplateData) => {
        if (!project) return;

        // Load any Google Fonts used in the template
        const fontLoadPromises: Promise<void>[] = [];
        const usedFonts = new Set<string>();

        template.elements.forEach(el => {
            if (el.type === 'text' && (el as Partial<TextElement>).textStyle?.fontFamily) {
                const style = (el as Partial<TextElement>).textStyle!;
                const family = style.fontFamily;

                // Create a unique key for font+weight to avoid duplicate requests
                const weight = style.fontWeight || 'normal';
                const weightStr = typeof weight === 'number' ? String(weight) : (weight === 'bold' ? '700' : '400');
                const key = `${family}:${weightStr}`;

                if (!usedFonts.has(key)) {
                    usedFonts.add(key);
                    const fontDef = GOOGLE_FONTS.find(f => f.family === family);
                    if (fontDef) {
                        // Check if exact variant exists, otherwise default to closest or all? 
                        // For simplicity/robustness, let's load the specific requested weight if available, or just regular.
                        // loadGoogleFont handles caching internally too.
                        const variantToLoad = fontDef.variants.includes(weightStr) ? weightStr : '400';
                        fontLoadPromises.push(loadGoogleFont(family, [variantToLoad]));
                    }
                }
            }
        });

        if (fontLoadPromises.length > 0) {
            console.log(`[TemplatesPanel] Loading ${fontLoadPromises.length} fonts for template...`);
            await Promise.all(fontLoadPromises);
        }

        // Create complete elements from template - sort by zIndex
        const completeElements = template.elements
            .map((el, idx) => createCompleteElement(el, idx))
            .sort((a, b) => a.zIndex - b.zIndex);

        // Build a proper Page object for loadPage
        const templatePage = {
            id: project.activePageId,
            name: template.name,
            width: template.width,
            height: template.height,
            dpi: 72,
            background: template.background,
            elements: completeElements,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Update page in store with dimensions, background, and elements
        updatePage(project.activePageId, {
            width: template.width,
            height: template.height,
            background: template.background,
            elements: completeElements,
        });

        // Use the proper loadPage method which handles z-index sorting and async image loading
        setTimeout(async () => {
            const fabricCanvas = getFabricCanvas();
            await fabricCanvas.loadPage(templatePage);
        }, 100);
    };

    // Filter templates
    const filteredTemplates = TEMPLATES.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by category
    const templatesByCategory = filteredTemplates.reduce((acc, template) => {
        if (!acc[template.category]) {
            acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
    }, {} as Record<string, TemplateData[]>);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-gray-800 font-semibold text-lg">Templates</h2>
                <div className="mt-3 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search in Templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {Object.entries(templatesByCategory).map(([category, templates]) => (
                    <div key={category} className="mb-6">
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                            {category}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => loadTemplate(template)}
                                    className="aspect-[4/5] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-violet-400 hover:shadow-lg cursor-pointer transition-all duration-200 group"
                                >
                                    {/* Template Preview - Dynamic based on template type */}
                                    <div
                                        className="w-full h-[80%] flex flex-col overflow-hidden"
                                        style={{ backgroundColor: template.background.type === 'solid' ? template.background.color : '#f5f5f5' }}
                                    >
                                        {template.id === 'price-list-1' ? (
                                            // Price List Preview
                                            <>
                                                <div className="w-full bg-[#2D4A3E] py-2 px-2 relative">
                                                    <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-[#C9A962] rotate-45 opacity-80"></div>
                                                    <p className="text-white text-[9px] font-bold text-center tracking-[2px] font-serif">PRICE LIST</p>
                                                    <p className="text-[#C9A962] text-[4px] font-medium text-center tracking-[1px] whitespace-nowrap">LUXURY SPA & WELLNESS</p>
                                                </div>
                                                <div className="w-[90%] h-[1px] bg-[#C9A962] mx-auto mt-1"></div>
                                                <div className="flex-1 px-2 py-1 overflow-hidden">
                                                    <p className="text-[#2D4A3E] text-[5px] font-semibold text-center tracking-[1px] mb-1">MASSAGE THERAPY</p>
                                                    <div className="space-y-[1px] mb-1">
                                                        <div className="flex justify-between px-1">
                                                            <span className="text-[4px] text-gray-600">Swedish Massage</span>
                                                            <span className="text-[4px] text-[#2D4A3E] font-semibold">$85</span>
                                                        </div>
                                                        <div className="flex justify-between px-1">
                                                            <span className="text-[4px] text-gray-600">Deep Tissue</span>
                                                            <span className="text-[4px] text-[#2D4A3E] font-semibold">$95</span>
                                                        </div>
                                                        <div className="flex justify-between px-1">
                                                            <span className="text-[4px] text-gray-600">Hot Stone</span>
                                                            <span className="text-[4px] text-[#2D4A3E] font-semibold">$120</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-[85%] h-[0.5px] bg-[#C9A962] mx-auto mb-1"></div>
                                                    <p className="text-[#2D4A3E] text-[5px] font-semibold text-center tracking-[1px] mb-0.5">FACIAL</p>
                                                    <div className="space-y-[1px]">
                                                        <div className="flex justify-between px-1">
                                                            <span className="text-[4px] text-gray-600">Classic Facial</span>
                                                            <span className="text-[4px] text-[#2D4A3E] font-semibold">$75</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : template.id === 'pricing-table-1' ? (
                                            // Pricing Table Preview - 3 cards
                                            <div className="flex-1 flex items-center justify-center gap-1 p-2">
                                                {/* Basic Card */}
                                                <div className="w-[30%] h-[90%] bg-[#F3E8EE] rounded flex flex-col overflow-hidden">
                                                    <div className="bg-[#4ECDC4] py-1">
                                                        <p className="text-white text-[5px] font-bold text-center">Basic</p>
                                                    </div>
                                                    <div className="flex-1 flex flex-col items-center pt-1">
                                                        <p className="text-[#1A535C] text-[7px] font-bold">$0</p>
                                                        <p className="text-gray-500 text-[3px]">/mo</p>
                                                        <div className="mt-1 space-y-[1px]">
                                                            <p className="text-[3px] text-gray-600">✓ 2 GB Storage</p>
                                                            <p className="text-[3px] text-gray-600">✓ 10 Accounts</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#4ECDC4] py-0.5 mx-1 mb-1 rounded">
                                                        <p className="text-white text-[3px] font-medium text-center">Choose</p>
                                                    </div>
                                                </div>
                                                {/* Standard Card */}
                                                <div className="w-[34%] h-full bg-[#F3E8EE] rounded flex flex-col overflow-hidden shadow-sm">
                                                    <div className="bg-[#1A535C] py-1.5">
                                                        <p className="text-white text-[6px] font-bold text-center">Standard</p>
                                                    </div>
                                                    <div className="flex-1 flex flex-col items-center pt-1">
                                                        <p className="text-[#1A535C] text-[9px] font-bold">$49</p>
                                                        <p className="text-gray-500 text-[3px]">/mo</p>
                                                        <div className="mt-1 space-y-[1px]">
                                                            <p className="text-[3px] text-gray-600">✓ 20 GB Storage</p>
                                                            <p className="text-[3px] text-gray-600">✓ 50 Accounts</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#1A535C] py-0.5 mx-1 mb-1 rounded">
                                                        <p className="text-white text-[3px] font-medium text-center">Choose</p>
                                                    </div>
                                                </div>
                                                {/* Premium Card */}
                                                <div className="w-[30%] h-[90%] bg-[#F3E8EE] rounded flex flex-col overflow-hidden">
                                                    <div className="bg-[#FF6B6B] py-1">
                                                        <p className="text-white text-[5px] font-bold text-center">Premium</p>
                                                    </div>
                                                    <div className="flex-1 flex flex-col items-center pt-1">
                                                        <p className="text-[#FF6B6B] text-[7px] font-bold">$99</p>
                                                        <p className="text-gray-500 text-[3px]">/mo</p>
                                                        <div className="mt-1 space-y-[1px]">
                                                            <p className="text-[3px] text-gray-600">✓ Unlimited</p>
                                                            <p className="text-[3px] text-gray-600">✓ Priority</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#FF6B6B] py-0.5 mx-1 mb-1 rounded">
                                                        <p className="text-white text-[3px] font-medium text-center">Choose</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'doctor-profile-1' ? (
                                            // Doctor Profile Preview - Full Layout
                                            <div className="flex-1 flex flex-col overflow-hidden text-[3px]">
                                                {/* Header Section */}
                                                <div className="w-full h-[20%] bg-[#E8F4F8] relative flex items-start px-1 pt-1">
                                                    <div className="w-3 h-3 rounded-full bg-[#EC0D64] flex-shrink-0"></div>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded mx-1 border border-gray-200"></div>
                                                    <div className="flex gap-0.5">
                                                        <div className="w-2 h-2 rounded-full bg-[#EC0D64] opacity-60"></div>
                                                        <div className="w-2 h-2 rounded-full bg-[#EC0D64] opacity-60"></div>
                                                    </div>
                                                </div>
                                                {/* Profile Row */}
                                                <div className="flex px-1 py-0.5 bg-white border-b border-gray-100">
                                                    <div className="w-8 h-8 rounded-full bg-[#2CA8D2] border border-black flex-shrink-0 -mt-3"></div>
                                                    <div className="flex-1 ml-1">
                                                        <div className="flex gap-1 text-[3px]">
                                                            <div><span className="text-[#02BAF1] font-bold">Followers</span> 60k</div>
                                                            <div><span className="text-[#02BAF1] font-bold">Following</span> 10k</div>
                                                        </div>
                                                        <div className="flex gap-0.5 mt-0.5">
                                                            <div className="bg-[#EC0D64] text-white px-1 py-0.5 rounded text-[2px]">Chat Now</div>
                                                            <div className="bg-[#EC0D64] text-white px-1 py-0.5 rounded text-[2px]">Follow</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-[2px]">
                                                        <p>❤️ Likes</p>
                                                        <p>⭐ Reviews</p>
                                                    </div>
                                                </div>
                                                {/* Doctor Info */}
                                                <div className="flex px-1 py-0.5 bg-white">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-[4px] text-gray-800">Dr. Cape Fernand</p>
                                                        <div className="flex gap-0.5 mt-0.5">
                                                            <span className="border border-[#EC0D64] px-0.5 rounded text-[2px]">Arthroscopy</span>
                                                            <span className="border border-[#EC0D64] px-0.5 rounded text-[2px]">Spine Surgery</span>
                                                        </div>
                                                        <p className="text-gray-500 text-[2px] mt-0.5 leading-tight">Lorem ipsum dolor sit amet...</p>
                                                    </div>
                                                    <div className="w-[40%] ml-1">
                                                        <p className="font-bold text-[3px] text-center">Services</p>
                                                        <div className="bg-gray-100 p-0.5 rounded text-[2px]">
                                                            <p>• Joint Replacement</p>
                                                            <p>• Arthroscopy</p>
                                                            <p>• Fracture Care</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* CTA & Map */}
                                                <div className="flex px-1 py-0.5 gap-1 bg-white flex-1">
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="bg-[#EC0D64] py-0.5 rounded">
                                                            <p className="text-white text-[2px] text-center font-medium">Online Consultation</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-[45%] bg-gray-200 rounded flex items-center justify-center border border-gray-300">
                                                        <p className="text-[2px] text-gray-500">📍 London, UK</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'food-blog-1' ? (
                                            // Food Blog Preview
                                            <div className="flex-1 relative overflow-hidden">
                                                {/* Food background image */}
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541809354-0f0cfe132960?w=200&q=60)' }}
                                                />
                                                {/* Overlay */}
                                                <div className="absolute inset-x-0 top-1/4 h-[40%] bg-[#9CF3DF]/50" />
                                                {/* Text Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <p className="text-white text-[12px] font-normal" style={{ fontFamily: 'cursive', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>Welcome</p>
                                                    <p className="text-black text-[8px] font-bold mt-0.5" style={{ fontFamily: 'cursive' }}>OUR FOOD BLOG</p>
                                                </div>
                                            </div>
                                        ) : template.id === 'cardio-fitness-1' ? (
                                            // Cardio Fitness Preview
                                            <div className="flex-1 relative overflow-hidden">
                                                {/* Workout background image (grayscale) */}
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center grayscale"
                                                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1614928228253-dc09cbc3b11c?w=200&q=60)' }}
                                                />
                                                {/* Golden hexagon overlay */}
                                                <div className="absolute left-0 top-0 bottom-0 w-[40%]">
                                                    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                                                        <path d="M 0 0 L 70 0 L 100 50 L 70 100 L 0 100 L 20 50 Z" fill="#C4AD1E" opacity="0.9" />
                                                    </svg>
                                                </div>
                                                {/* Text Content */}
                                                <div className="absolute left-1 top-2 text-left">
                                                    <div className="bg-white px-1 py-0.5 inline-block">
                                                        <p className="text-black text-[4px] font-bold">10 MINUTES FITNESS</p>
                                                    </div>
                                                    <p className="text-white text-[14px] font-black mt-0.5 leading-none">CARDIO</p>
                                                    <p className="text-white text-[4px] mt-0.5">EXERCISE FOR BEGINNER</p>
                                                </div>
                                                {/* Subscribe button */}
                                                <div className="absolute right-1 bottom-1 bg-[#C4AD1E] px-1 py-0.5">
                                                    <p className="text-white text-[3px]">WATCH & SUBSCRIBE</p>
                                                </div>
                                            </div>
                                        ) : template.id === 'tech-startup-pitch' ? (
                                            // Tech Startup Pitch Preview
                                            <div className="flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(45deg, #667EEA, #764BA2)' }}>
                                                {/* Decorative circles */}
                                                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white/10"></div>
                                                <div className="absolute left-1 bottom-1 w-5 h-5 rounded-full bg-white/10"></div>
                                                {/* Content */}
                                                <div className="absolute left-1.5 top-2">
                                                    <p className="text-white text-[10px] font-bold tracking-wide">NEXAFLOW</p>
                                                    <p className="text-white/80 text-[4px] mt-0.5">AI-Powered Workflow</p>
                                                </div>
                                                {/* Stats boxes */}
                                                <div className="absolute left-1.5 bottom-3 flex gap-1">
                                                    <div className="bg-white/15 rounded px-1 py-0.5">
                                                        <p className="text-white text-[6px] font-bold">$50M+</p>
                                                        <p className="text-white/70 text-[3px]">Funding</p>
                                                    </div>
                                                    <div className="bg-white/15 rounded px-1 py-0.5">
                                                        <p className="text-white text-[6px] font-bold">500K+</p>
                                                        <p className="text-white/70 text-[3px]">Users</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'lifestyle-quote' ? (
                                            // Lifestyle Quote Preview
                                            <div className="flex-1 relative overflow-hidden flex items-center justify-center" style={{ background: 'radial-gradient(circle at center, #FED9B7, #F07167)' }}>
                                                {/* Decorative quote mark */}
                                                <div className="absolute left-1 top-0 text-white/20 text-[28px] font-serif leading-none">"</div>
                                                {/* Quote content */}
                                                <div className="flex flex-col items-center px-2 mt-2">
                                                    <p className="text-white text-[5px] italic text-center leading-tight font-serif">The only way to do great work is to love what you do.</p>
                                                    <div className="w-4 h-[1px] bg-white/60 my-1"></div>
                                                    <p className="text-white/80 text-[4px]">— Steve Jobs</p>
                                                </div>
                                                {/* Hashtags */}
                                                <p className="absolute bottom-1 text-white/60 text-[3px]">#motivation</p>
                                            </div>
                                        ) : (
                                            // Generic fallback preview
                                            <div className="flex-1 flex items-center justify-center">
                                                <span className="text-gray-400 text-lg">{template.name.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Template name */}
                                    <div className="w-full h-[20%] flex items-center justify-center bg-white relative z-10 border-t border-gray-100">
                                        <span className="text-gray-600 text-xs font-medium text-center group-hover:text-violet-600 transition-colors">
                                            {template.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Empty state when no templates match */}
                {filteredTemplates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Layout size={48} strokeWidth={1} />
                        <p className="mt-4 text-sm">No templates found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
