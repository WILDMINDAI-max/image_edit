'use client';

import { useState } from 'react';
import { Search, Layout } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { CanvasElement, TextElement, ShapeElement, ImageElement, StickerElement, SVGElement as CanvasSVGElement } from '@/types/canvas';
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
                textStyle: { fontFamily: 'Playfair Display', fontSize: 42, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
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
    // Pricing Table Template - Modern Dark Theme
    {
        id: 'pricing-table-1',
        name: 'Pricing Table',
        category: 'Business',
        width: 1200,
        height: 800,
        background: { type: 'solid', color: '#0F0F23' },
        elements: [
            // Main Background Accent Shape
            {
                type: 'shape',
                name: 'BG Accent',
                shapeType: 'circle',
                transform: { x: 600, y: 400, width: 800, height: 800, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1A1A3E', stroke: null, strokeWidth: 0, opacity: 0.4 },
                zIndex: 0,
            } as Partial<ShapeElement>,

            // === STARTER PLAN (Left Card) ===
            // Card Background with glass effect
            {
                type: 'shape',
                name: 'Starter Card BG',
                shapeType: 'rectangle',
                transform: { x: 220, y: 400, width: 300, height: 520, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E1E3F', stroke: '#3B82F6', strokeWidth: 2, opacity: 0.95 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Starter Header Accent
            {
                type: 'shape',
                name: 'Starter Header Accent',
                shapeType: 'rectangle',
                transform: { x: 220, y: 175, width: 300, height: 6, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#3B82F6', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Starter Icon
            {
                type: 'text',
                name: 'Starter Icon',
                content: '🚀',
                transform: { x: 220, y: 210, width: 60, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 36, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Starter Title
            {
                type: 'text',
                name: 'Starter Title',
                content: 'STARTER',
                transform: { x: 220, y: 260, width: 260, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 22, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Starter Price
            {
                type: 'text',
                name: 'Starter Price',
                content: '$0/mo',
                transform: { x: 220, y: 328, width: 160, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#3B82F6', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 44, fontWeight: 800, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,
            // Starter Description
            {
                type: 'text',
                name: 'Starter Desc',
                content: 'Perfect for getting started',
                transform: { x: 220, y: 370, width: 260, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#9CA3AF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 14,
            } as Partial<TextElement>,
            // Starter Divider
            {
                type: 'shape',
                name: 'Starter Divider',
                shapeType: 'rectangle',
                transform: { x: 220, y: 405, width: 240, height: 1, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#374151', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 15,
            } as Partial<ShapeElement>,
            // Starter Features
            {
                type: 'text',
                name: 'Starter Features',
                content: '✓ 2 GB Storage\n✓ 5 Projects\n✓ Basic Analytics\n✓ Email Support',
                transform: { x: 220, y: 490, width: 240, height: 130, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D1D5DB', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 15, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 2.0, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 16,
            } as Partial<TextElement>,
            // Starter CTA Button
            {
                type: 'shape',
                name: 'Starter CTA BG',
                shapeType: 'rectangle',
                transform: { x: 220, y: 610, width: 220, height: 48, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: 'transparent', stroke: '#3B82F6', strokeWidth: 2, opacity: 1 },
                zIndex: 17,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Starter CTA',
                content: 'Get Started Free',
                transform: { x: 220, y: 610, width: 200, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#3B82F6', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 18,
            } as Partial<TextElement>,

            // === PRO PLAN (Center Card - Featured) ===
            // Popular Badge
            {
                type: 'shape',
                name: 'Pro Badge BG',
                shapeType: 'rectangle',
                transform: { x: 600, y: 57, width: 140, height: 32, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#8B5CF6', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Pro Badge Text',
                content: 'MOST POPULAR',
                transform: { x: 600, y: 57, width: 130, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 11, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 6,
            } as Partial<TextElement>,
            // Pro Card Glow Effect
            {
                type: 'shape',
                name: 'Pro Card Glow',
                shapeType: 'rectangle',
                transform: { x: 600, y: 408, width: 340, height: 600, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#8B5CF6', stroke: null, strokeWidth: 0, opacity: 0.15 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Pro Card Background
            {
                type: 'shape',
                name: 'Pro Card BG',
                shapeType: 'rectangle',
                transform: { x: 600, y: 408, width: 320, height: 580, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E1E3F', stroke: '#8B5CF6', strokeWidth: 3, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            // Pro Header Gradient
            {
                type: 'shape',
                name: 'Pro Header Accent',
                shapeType: 'rectangle',
                transform: { x: 600, y: 153, width: 320, height: 6, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#A855F7', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,
            // Pro Icon
            {
                type: 'text',
                name: 'Pro Icon',
                content: '⚡',
                transform: { x: 600, y: 195, width: 60, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 40, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 20,
            } as Partial<TextElement>,
            // Pro Title
            {
                type: 'text',
                name: 'Pro Title',
                content: 'PROFESSIONAL',
                transform: { x: 610, y: 248, width: 280, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 22, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 21,
            } as Partial<TextElement>,
            // Pro Price
            {
                type: 'text',
                name: 'Pro Price',
                content: '$49/mo',
                transform: { x: 600, y: 328, width: 180, height: 65, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#A855F7', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 44, fontWeight: 800, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 22,
            } as Partial<TextElement>,
            // Pro Description
            {
                type: 'text',
                name: 'Pro Desc',
                content: 'Best for growing teams',
                transform: { x: 600, y: 365, width: 280, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#9CA3AF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 24,
            } as Partial<TextElement>,
            // Pro Divider
            {
                type: 'shape',
                name: 'Pro Divider',
                shapeType: 'rectangle',
                transform: { x: 600, y: 400, width: 260, height: 1, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#374151', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 25,
            } as Partial<ShapeElement>,
            // Pro Features
            {
                type: 'text',
                name: 'Pro Features',
                content: '✓ 50 GB Storage\n✓ Unlimited Projects\n✓ Advanced Analytics\n✓ Priority Support\n✓ Team Collaboration',
                transform: { x: 600, y: 505, width: 260, height: 160, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D1D5DB', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 15, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 2.0, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 26,
            } as Partial<TextElement>,
            // Pro CTA Button (Outline like others)
            {
                type: 'shape',
                name: 'Pro CTA BG',
                shapeType: 'rectangle',
                transform: { x: 610, y: 652, width: 220, height: 48, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: 'transparent', stroke: '#8B5CF6', strokeWidth: 2, opacity: 1 },
                zIndex: 27,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Pro CTA',
                content: 'Start Free Trial',
                transform: { x: 610, y: 652, width: 200, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#8B5CF6', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 28,
            } as Partial<TextElement>,

            // === ENTERPRISE PLAN (Right Card) ===
            // Enterprise Card Background
            {
                type: 'shape',
                name: 'Enterprise Card BG',
                shapeType: 'rectangle',
                transform: { x: 980, y: 400, width: 300, height: 520, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E1E3F', stroke: '#F97316', strokeWidth: 2, opacity: 0.95 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Enterprise Header Accent
            {
                type: 'shape',
                name: 'Enterprise Header Accent',
                shapeType: 'rectangle',
                transform: { x: 980, y: 175, width: 300, height: 6, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F97316', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Enterprise Icon
            {
                type: 'text',
                name: 'Enterprise Icon',
                content: '🏢',
                transform: { x: 980, y: 210, width: 60, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 36, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 30,
            } as Partial<TextElement>,
            // Enterprise Title
            {
                type: 'text',
                name: 'Enterprise Title',
                content: 'ENTERPRISE',
                transform: { x: 980, y: 260, width: 260, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 22, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 31,
            } as Partial<TextElement>,
            // Enterprise Price
            {
                type: 'text',
                name: 'Enterprise Price',
                content: '$149/mo',
                transform: { x: 980, y: 333, width: 200, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F97316', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 44, fontWeight: 800, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 32,
            } as Partial<TextElement>,
            // Enterprise Description
            {
                type: 'text',
                name: 'Enterprise Desc',
                content: 'For large organizations',
                transform: { x: 980, y: 370, width: 260, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#9CA3AF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 34,
            } as Partial<TextElement>,
            // Enterprise Divider
            {
                type: 'shape',
                name: 'Enterprise Divider',
                shapeType: 'rectangle',
                transform: { x: 980, y: 405, width: 240, height: 1, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#374151', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 35,
            } as Partial<ShapeElement>,
            // Enterprise Features
            {
                type: 'text',
                name: 'Enterprise Features',
                content: '✓ Unlimited Storage\n✓ Custom Integrations\n✓ Dedicated Manager\n✓ SLA Guarantee',
                transform: { x: 980, y: 490, width: 240, height: 130, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D1D5DB', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 15, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 2.0, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 36,
            } as Partial<TextElement>,
            // Enterprise CTA Button
            {
                type: 'shape',
                name: 'Enterprise CTA BG',
                shapeType: 'rectangle',
                transform: { x: 980, y: 610, width: 220, height: 48, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: 'transparent', stroke: '#F97316', strokeWidth: 2, opacity: 1 },
                zIndex: 37,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Enterprise CTA',
                content: 'Contact Sales',
                transform: { x: 980, y: 610, width: 200, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#F97316', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 38,
            } as Partial<TextElement>,
        ],
    },
    // Doctor Profile Template - Modern Medical Design
    {
        id: 'doctor-profile-1',
        name: 'Doctor Profile',
        category: 'Medical',
        width: 1080,
        height: 1920,
        background: { type: 'solid', color: '#F8FAFC' },
        elements: [
            // === HEADER GRADIENT SECTION ===
            {
                type: 'shape',
                name: 'Header Gradient',
                shapeType: 'rectangle',
                transform: { x: 540, y: 280, width: 1080, height: 560, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Header Accent Circle
            {
                type: 'shape',
                name: 'Header Accent',
                shapeType: 'circle',
                transform: { x: 900, y: 100, width: 300, height: 300, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#14B8A6', stroke: null, strokeWidth: 0, opacity: 0.3 },
                zIndex: 2,
            } as Partial<ShapeElement>,

            // === TOP BAR ===
            {
                type: 'text',
                name: 'Clinic Name',
                content: 'HEALTHCARE CLINIC',
                transform: { x: 540, y: 60, width: 400, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.9 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,

            // === DOCTOR PHOTO SECTION ===
            // Photo Background Circle (Empty Placeholder)
            {
                type: 'shape',
                name: 'Photo Circle',
                shapeType: 'circle',
                transform: { x: 540, y: 350, width: 280, height: 280, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: '#0D9488', strokeWidth: 4, opacity: 1 },
                zIndex: 6,
            } as Partial<ShapeElement>,
            // Verified Badge
            {
                type: 'shape',
                name: 'Verified Badge',
                shapeType: 'circle',
                transform: { x: 680, y: 440, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 3, opacity: 1 },
                zIndex: 7,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Verified Icon',
                content: '✓',
                transform: { x: 680, y: 440, width: 30, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 8,
            } as Partial<TextElement>,

            // === DOCTOR INFO ===
            {
                type: 'text',
                name: 'Name',
                content: 'Name',
                transform: { x: 540, y: 597, width: 500, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0F172A', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 38, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 20,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Specialty',
                content: 'Orthopedic Surgeon',
                transform: { x: 540, y: 630, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 20, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 21,
            } as Partial<TextElement>,

            // === STATS ROW ===
            // Stats Background
            {
                type: 'shape',
                name: 'Stats BG',
                shapeType: 'rectangle',
                transform: { x: 540, y: 720, width: 900, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: '#E2E8F0', strokeWidth: 1, opacity: 1 },
                zIndex: 15,
            } as Partial<ShapeElement>,
            // Experience
            {
                type: 'text',
                name: 'Experience Value',
                content: '15+',
                transform: { x: 240, y: 705, width: 100, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 32, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 16,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Experience Label',
                content: 'Years Exp.',
                transform: { x: 240, y: 740, width: 120, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#64748B', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 17,
            } as Partial<TextElement>,
            // Patients
            {
                type: 'text',
                name: 'Patients Value',
                content: '5000+',
                transform: { x: 540, y: 705, width: 140, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 32, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 18,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Patients Label',
                content: 'Patients',
                transform: { x: 540, y: 740, width: 120, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#64748B', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 19,
            } as Partial<TextElement>,
            // Rating
            {
                type: 'text',
                name: 'Rating Value',
                content: '4.9',
                transform: { x: 840, y: 705, width: 100, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 32, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 22,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Rating Label',
                content: '⭐ Rating',
                transform: { x: 840, y: 740, width: 120, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#64748B', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 23,
            } as Partial<TextElement>,

            // === ABOUT SECTION ===
            {
                type: 'text',
                name: 'About Title',
                content: 'About',
                transform: { x: 150, y: 830, width: 150, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0F172A', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 25,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'About Text',
                content: 'A board-certified surgeon with over 15 years of experience in joint replacement and sports medicine. Specializing in minimally invasive techniques for faster patient recovery.',
                transform: { x: 540, y: 920, width: 920, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#475569', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.7, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 26,
            } as Partial<TextElement>,

            // === SERVICES SECTION ===
            {
                type: 'text',
                name: 'Services Title',
                content: 'Services',
                transform: { x: 165, y: 1020, width: 180, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0F172A', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 30,
            } as Partial<TextElement>,
            // Service Card 1
            {
                type: 'shape',
                name: 'Service Card 1',
                shapeType: 'rectangle',
                transform: { x: 290, y: 1120, width: 460, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: '#E2E8F0', strokeWidth: 1, opacity: 1 },
                zIndex: 31,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Service 1 Title',
                content: '🦴 Joint Replacement',
                transform: { x: 290, y: 1110, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0F172A', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 32,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Service 1 Desc',
                content: 'Hip, knee & shoulder replacements',
                transform: { x: 290, y: 1140, width: 400, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#64748B', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 33,
            } as Partial<TextElement>,
            // Service Card 2
            {
                type: 'shape',
                name: 'Service Card 2',
                shapeType: 'rectangle',
                transform: { x: 790, y: 1120, width: 460, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: '#E2E8F0', strokeWidth: 1, opacity: 1 },
                zIndex: 34,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Service 2 Title',
                content: '⚡ Sports Medicine',
                transform: { x: 790, y: 1110, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0F172A', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 35,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Service 2 Desc',
                content: 'Injury treatment & prevention',
                transform: { x: 790, y: 1140, width: 400, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#64748B', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 36,
            } as Partial<TextElement>,

            // === CTA BUTTON ===
            {
                type: 'shape',
                name: 'CTA BG',
                shapeType: 'rectangle',
                transform: { x: 540, y: 1280, width: 400, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 40,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'CTA Text',
                content: 'Book Appointment',
                transform: { x: 540, y: 1280, width: 350, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 20, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 41,
            } as Partial<TextElement>,

            // === CONTACT INFO ===
            {
                type: 'text',
                name: 'Contact Title',
                content: 'Contact',
                transform: { x: 165, y: 1380, width: 180, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0F172A', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 45,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Phone',
                content: '📞 +1 (555) 123-4567',
                transform: { x: 270, y: 1440, width: 300, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#475569', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 46,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Email',
                content: '✉️ dr.mitchell@healthcare.com',
                transform: { x: 300, y: 1480, width: 360, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#475569', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 47,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Location',
                content: '📍 123 Medical Center, New York, NY',
                transform: { x: 340, y: 1520, width: 440, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#475569', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 48,
            } as Partial<TextElement>,

            // === FOOTER ===
            {
                type: 'shape',
                name: 'Footer BG',
                shapeType: 'rectangle',
                transform: { x: 540, y: 1870, width: 1080, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0D9488', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 50,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Footer Text',
                content: 'www.healthcareclinic.com',
                transform: { x: 540, y: 1870, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.9 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
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
                src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1280&q=80',
                transform: { x: 640, y: 360, width: 1280, height: 720, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
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
                src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1280&q=80',
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
                transform: { x: 352, y: 231, width: 450, height: 63.28, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
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
                transform: { x: 529, y: 367, width: 886, height: 226, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
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
                transform: { x: 1093, y: 600, width: 327, height: 46.33, scaleX: 1, scaleY: 1, rotation: 0, originX: 'center', originY: 'center' },
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

    {
        id: 'cyber-monday-1',
        name: 'Cyber Monday',
        category: 'Business',
        width: 1920,
        height: 1080,
        background: { type: 'solid', color: '#09090B' },
        elements: [
            // Grid Lines
            {
                type: 'shape',
                name: 'Grid 1',
                shapeType: 'rectangle',
                transform: { x: 960, y: 540, width: 1800, height: 900, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: '#22D3EE', strokeWidth: 2, opacity: 0.2 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Circle Glow',
                shapeType: 'circle',
                transform: { x: 960, y: 540, width: 800, height: 800, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#22D3EE', stroke: null, strokeWidth: 0, opacity: 0.1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Glitch Text Effect (Layered)
            {
                type: 'text',
                name: 'Title Shadow',
                content: 'CYBER\nMONDAY',
                transform: { x: 965, y: 485, width: 1200, height: 500, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#EC4899', opacity: 0.8 },
                textStyle: { fontFamily: 'Inter', fontSize: 160, fontWeight: 900, fontStyle: 'normal', textAlign: 'center', lineHeight: 0.9, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 3,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Title Main',
                content: 'CYBER\nMONDAY',
                transform: { x: 986, y: 485, width: 1200, height: 500, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 164, fontWeight: 900, fontStyle: 'normal', textAlign: 'center', lineHeight: 0.9, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 4,
            } as Partial<TextElement>,
            // Discount Box
            {
                type: 'shape',
                name: 'Discount BG',
                shapeType: 'rectangle',
                transform: { x: 960, y: 850, width: 700, height: 120, rotation: -2, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FACC15', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Discount Text',
                content: 'UP TO 70% OFF',
                transform: { x: 960, y: 850, width: 700, height: 80, rotation: -2, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#000000', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 60, fontWeight: 800, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 6,
            } as Partial<TextElement>,
        ],
    },
    {
        id: 'art-exhibit-1',
        name: 'Art Exhibition',
        category: 'Events',
        width: 1080,
        height: 1080,
        background: { type: 'solid', color: '#F3F4F6' },
        elements: [
            // Abstract Shapes
            {
                type: 'shape',
                name: 'Red Circle',
                shapeType: 'circle',
                transform: { x: 800, y: 300, width: 350, height: 350, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#EF4444', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Black Rect',
                shapeType: 'rectangle',
                transform: { x: 250, y: 400, width: 300, height: 500, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#000000', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Image
            {
                type: 'image',
                name: 'Art Image',
                src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
                transform: { x: 540, y: 540, width: 500, height: 500, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: null, strokeWidth: 0, opacity: 1 },
                filters: { grayscale: true, contrast: 20, brightness: 0, saturation: 0, blur: 0, sepia: false, invert: false },
                zIndex: 3,
            } as Partial<ImageElement>,
            // Typography
            {
                type: 'text',
                name: 'Title',
                content: 'MODERN\nABSTRACT',
                transform: { x: 540, y: 900, width: 800, height: 200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#000000', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 80, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 4,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Date',
                content: 'JULY 20 - AUG 30',
                transform: { x: 540, y: 1000, width: 500, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#000000', opacity: 0.7 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 5,
            } as Partial<TextElement>,
        ],
    },
    // Party Event Poster - Neon Frame Design
    {
        id: 'party-event-neon',
        name: 'Party Event Neon',
        category: 'Events',
        width: 1080,
        height: 1350,
        background: {
            type: 'gradient',
            gradientType: 'radial',
            radialPosition: 'center',
            colorStops: [
                { offset: 0, color: '#1a0a2e' },
                { offset: 0.5, color: '#0d1b2a' },
                { offset: 1, color: '#0a0a12' }
            ]
        },
        elements: [
            // Decorative gradient circles for party feel
            {
                type: 'shape',
                name: 'Glow Circle 1',
                shapeType: 'circle',
                transform: { x: 200, y: 300, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF1493', stroke: null, strokeWidth: 0, opacity: 0.15 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Glow Circle 2',
                shapeType: 'circle',
                transform: { x: 880, y: 500, width: 350, height: 350, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#00BFFF', stroke: null, strokeWidth: 0, opacity: 0.12 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Glow Circle 3',
                shapeType: 'circle',
                transform: { x: 300, y: 1000, width: 500, height: 500, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#8A2BE2', stroke: null, strokeWidth: 0, opacity: 0.18 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // FULL NEON FRAME - using layered shapes for reliable glow effect
            // Top frame glow layer (outer glow)
            {
                type: 'shape',
                name: 'Neon Frame Top Glow',
                shapeType: 'rectangle',
                transform: { x: 540, y: 80, width: 930, height: 20, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#00BFFF', stroke: null, strokeWidth: 0, opacity: 0.3 },
                zIndex: 8,
            } as Partial<ShapeElement>,
            // Top frame core (white line)
            {
                type: 'shape',
                name: 'Neon Frame Top',
                shapeType: 'rectangle',
                transform: { x: 540, y: 80, width: 920, height: 3, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 10,
            } as Partial<ShapeElement>,
            // Bottom frame glow layer
            {
                type: 'shape',
                name: 'Neon Frame Bottom Glow',
                shapeType: 'rectangle',
                transform: { x: 540, y: 1270, width: 930, height: 20, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#00BFFF', stroke: null, strokeWidth: 0, opacity: 0.3 },
                zIndex: 8,
            } as Partial<ShapeElement>,
            // Bottom frame core
            {
                type: 'shape',
                name: 'Neon Frame Bottom',
                shapeType: 'rectangle',
                transform: { x: 540, y: 1270, width: 920, height: 3, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 10,
            } as Partial<ShapeElement>,
            // Left frame glow layer
            {
                type: 'shape',
                name: 'Neon Frame Left Glow',
                shapeType: 'rectangle',
                transform: { x: 80, y: 675, width: 20, height: 1200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#00BFFF', stroke: null, strokeWidth: 0, opacity: 0.3 },
                zIndex: 8,
            } as Partial<ShapeElement>,
            // Left frame core
            {
                type: 'shape',
                name: 'Neon Frame Left',
                shapeType: 'rectangle',
                transform: { x: 80, y: 675, width: 3, height: 1190, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 10,
            } as Partial<ShapeElement>,
            // Right frame glow layer
            {
                type: 'shape',
                name: 'Neon Frame Right Glow',
                shapeType: 'rectangle',
                transform: { x: 1000, y: 675, width: 20, height: 1200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#00BFFF', stroke: null, strokeWidth: 0, opacity: 0.3 },
                zIndex: 8,
            } as Partial<ShapeElement>,
            // Right frame core
            {
                type: 'shape',
                name: 'Neon Frame Right',
                shapeType: 'rectangle',
                transform: { x: 1000, y: 675, width: 3, height: 1190, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 10,
            } as Partial<ShapeElement>,
            // Event Type Badge
            {
                type: 'text',
                name: 'Event Badge',
                content: '★ EXCLUSIVE EVENT ★',
                transform: { x: 540, y: 140, width: 500, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFD700', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 6, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 20,
            } as Partial<TextElement>,
            // Brand name
            {
                type: 'text',
                name: 'Brand Name',
                content: "BHAILU'S",
                transform: { x: 540, y: 220, width: 700, height: 70, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 48, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 8, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 21,
            } as Partial<TextElement>,
            // Presents
            {
                type: 'text',
                name: 'Presents',
                content: 'PRESENTS',
                transform: { x: 540, y: 280, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF6B9D', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 10, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 22,
            } as Partial<TextElement>,
            // THE BIG BANG
            {
                type: 'text',
                name: 'Main Title 1',
                content: 'THE BIG BANG',
                transform: { x: 540, y: 420, width: 900, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1, shadow: { color: '#00BFFF', blur: 30, offsetX: 0, offsetY: 0 } },
                textStyle: { fontFamily: 'Poppins', fontSize: 80, fontWeight: 900, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.0, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 23,
            } as Partial<TextElement>,
            // PARTY (with glow effect)
            {
                type: 'text',
                name: 'Main Title 2',
                content: 'PARTY',
                transform: { x: 540, y: 560, width: 900, height: 140, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1, shadow: { color: '#FF1493', blur: 40, offsetX: 0, offsetY: 0 } },
                textStyle: { fontFamily: 'Poppins', fontSize: 120, fontWeight: 900, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.0, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 24,
            } as Partial<TextElement>,
            // Decorative line
            {
                type: 'shape',
                name: 'Divider Line',
                shapeType: 'rectangle',
                transform: { x: 540, y: 680, width: 200, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFD700', stroke: null, strokeWidth: 0, opacity: 0.8 },
                zIndex: 15,
            } as Partial<ShapeElement>,
            // CTA
            {
                type: 'text',
                name: 'CTA Text',
                content: '✨ SECURE YOUR SPOT ✨',
                transform: { x: 540, y: 740, width: 700, height: 45, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFD700', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 25,
            } as Partial<TextElement>,
            // Feature
            {
                type: 'text',
                name: 'Feature Text',
                content: 'UNLIMITED FOOD & MOCKTAIL',
                transform: { x: 540, y: 820, width: 800, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.9 },
                textStyle: { fontFamily: 'Poppins', fontSize: 26, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 26,
            } as Partial<TextElement>,
            // Date
            {
                type: 'text',
                name: 'Date',
                content: '10TH OF JANUARY',
                transform: { x: 540, y: 940, width: 600, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF6B9D', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 42, fontWeight: 700, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 27,
            } as Partial<TextElement>,
            // Time
            {
                type: 'text',
                name: 'Time',
                content: 'STARTING AT 3 PM',
                transform: { x: 540, y: 1010, width: 500, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 22, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 5, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 28,
            } as Partial<TextElement>,
            // Location
            {
                type: 'text',
                name: 'Location',
                content: 'AHMEDABAD CITY',
                transform: { x: 540, y: 1070, width: 500, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.7 },
                textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 10, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 29,
            } as Partial<TextElement>,
            // Contact Info
            {
                type: 'text',
                name: 'Contact',
                content: 'FOR MORE DETAILS: +91 7600686748',
                transform: { x: 540, y: 1180, width: 600, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 0.6 },
                textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 30,
            } as Partial<TextElement>,
        ],
    },
    // Certificate of Achievement Template - Elegant Navy & Gold Design
    {
        id: 'certificate-achievement-1',
        name: 'Certificate of Achievement',
        category: 'Business',
        width: 1600,
        height: 1200,
        background: { type: 'solid', color: '#FDFBF7' },
        elements: [
            // === OUTER DECORATIVE BORDER ===
            {
                type: 'shape',
                name: 'Border Outer',
                shapeType: 'rectangle',
                transform: { x: 800, y: 600, width: 1540, height: 1140, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: '#1E3A5F', strokeWidth: 8, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Inner border
            {
                type: 'shape',
                name: 'Border Inner',
                shapeType: 'rectangle',
                transform: { x: 800, y: 600, width: 1480, height: 1080, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: '#C9A227', strokeWidth: 3, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,

            // === CORNER ORNAMENTS ===
            // Top-left corner ornament
            {
                type: 'shape',
                name: 'Corner TL Outer',
                shapeType: 'circle',
                transform: { x: 100, y: 100, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Corner TL Inner',
                shapeType: 'circle',
                transform: { x: 100, y: 100, width: 30, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,
            // Top-right corner ornament
            {
                type: 'shape',
                name: 'Corner TR Outer',
                shapeType: 'circle',
                transform: { x: 1500, y: 100, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Corner TR Inner',
                shapeType: 'circle',
                transform: { x: 1500, y: 100, width: 30, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,
            // Bottom-left corner ornament
            {
                type: 'shape',
                name: 'Corner BL Outer',
                shapeType: 'circle',
                transform: { x: 100, y: 1100, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Corner BL Inner',
                shapeType: 'circle',
                transform: { x: 100, y: 1100, width: 30, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,
            // Bottom-right corner ornament
            {
                type: 'shape',
                name: 'Corner BR Outer',
                shapeType: 'circle',
                transform: { x: 1500, y: 1100, width: 50, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Corner BR Inner',
                shapeType: 'circle',
                transform: { x: 1500, y: 1100, width: 30, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,

            // === HEADER RIBBON/BADGE ===
            {
                type: 'shape',
                name: 'Header Ribbon',
                shapeType: 'rectangle',
                transform: { x: 800, y: 140, width: 400, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Header Text',
                content: '✦ OFFICIAL DOCUMENT ✦',
                transform: { x: 800, y: 140, width: 380, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,

            // === MAIN CERTIFICATE TITLE ===
            {
                type: 'text',
                name: 'Certificate Title',
                content: 'Certificate',
                transform: { x: 800, y: 260, width: 1000, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 96, fontWeight: 400, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.1, letterSpacing: 4, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Decorative line under title
            {
                type: 'shape',
                name: 'Title Underline Left',
                shapeType: 'rectangle',
                transform: { x: 500, y: 320, width: 200, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 6,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Title Diamond',
                shapeType: 'rectangle',
                transform: { x: 800, y: 320, width: 12, height: 12, rotation: 45, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 7,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Title Underline Right',
                shapeType: 'rectangle',
                transform: { x: 1100, y: 320, width: 200, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 6,
            } as Partial<ShapeElement>,

            // OF ACHIEVEMENT text
            {
                type: 'text',
                name: 'Achievement Text',
                content: 'of Achievement',
                transform: { x: 800, y: 380, width: 500, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 400, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,

            // === PRESENTATION TEXT ===
            {
                type: 'text',
                name: 'Presented To',
                content: 'This Certificate is Proudly Presented to',
                transform: { x: 800, y: 480, width: 800, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#5A6C7D', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 13,
            } as Partial<TextElement>,

            // === RECIPIENT NAME ===
            {
                type: 'text',
                name: 'Recipient Name',
                content: 'John William Smith',
                transform: { x: 800, y: 570, width: 1000, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', opacity: 1 },
                textStyle: { fontFamily: 'Great Vibes', fontSize: 72, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 14,
            } as Partial<TextElement>,
            // Name underline with ornaments
            {
                type: 'shape',
                name: 'Name Line Left',
                shapeType: 'rectangle',
                transform: { x: 450, y: 630, width: 250, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 0.7 },
                zIndex: 8,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Name Star',
                shapeType: 'circle',
                transform: { x: 800, y: 630, width: 10, height: 10, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 9,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Name Line Right',
                shapeType: 'rectangle',
                transform: { x: 1150, y: 630, width: 250, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 0.7 },
                zIndex: 8,
            } as Partial<ShapeElement>,

            // === DESCRIPTION TEXT ===
            {
                type: 'text',
                name: 'Description',
                content: 'In recognition of outstanding dedication, exceptional performance,\nand remarkable contribution to excellence in their field of expertise.',
                transform: { x: 800, y: 720, width: 1000, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#5A6C7D', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.8, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 15,
            } as Partial<TextElement>,

            // === SEAL/BADGE ===
            {
                type: 'shape',
                name: 'Seal Outer',
                shapeType: 'circle',
                transform: { x: 800, y: 880, width: 120, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 20,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Seal Middle',
                shapeType: 'circle',
                transform: { x: 800, y: 880, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 21,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Seal Inner',
                shapeType: 'circle',
                transform: { x: 800, y: 880, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: '#C9A227', strokeWidth: 2, opacity: 1 },
                zIndex: 22,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Seal Icon',
                content: '★',
                transform: { x: 800, y: 880, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A227', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 40, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 23,
            } as Partial<TextElement>,

            // === DATE SECTION ===
            {
                type: 'text',
                name: 'Date Value',
                content: 'January 9th, 2026',
                transform: { x: 350, y: 1000, width: 250, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 16,
            } as Partial<TextElement>,
            {
                type: 'shape',
                name: 'Date Line',
                shapeType: 'rectangle',
                transform: { x: 350, y: 1025, width: 200, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 0.5 },
                zIndex: 8,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Date Label',
                content: 'Date Awarded',
                transform: { x: 350, y: 1055, width: 150, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#5A6C7D', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 12, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 17,
            } as Partial<TextElement>,

            // === SIGNATURE SECTION ===
            {
                type: 'text',
                name: 'Signature',
                content: 'Director Signature',
                transform: { x: 1250, y: 1000, width: 250, height: 35, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', opacity: 1 },
                textStyle: { fontFamily: 'Great Vibes', fontSize: 28, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 18,
            } as Partial<TextElement>,
            {
                type: 'shape',
                name: 'Signature Line',
                shapeType: 'rectangle',
                transform: { x: 1250, y: 1025, width: 200, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A5F', stroke: null, strokeWidth: 0, opacity: 0.5 },
                zIndex: 8,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Signature Label',
                content: 'Authorized Signature',
                transform: { x: 1250, y: 1055, width: 180, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#5A6C7D', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 12, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 19,
            } as Partial<TextElement>,

            // === CERTIFICATE ID ===
            {
                type: 'text',
                name: 'Certificate ID',
                content: 'Certificate No: WM-2026-0109',
                transform: { x: 800, y: 1000, width: 300, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#5A6C7D', opacity: 0.7 },
                textStyle: { fontFamily: 'Poppins', fontSize: 11, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 15,
            } as Partial<TextElement>,
        ],
    },
    // ========== A4 PORTRAIT TEMPLATES (2480 x 3508 px at 300dpi) ==========
    // A4 Modern Resume Template - ENHANCED
    {
        id: 'a4-resume-modern',
        name: 'Modern Resume',
        category: 'A4 Portrait',
        width: 2480,
        height: 3508,
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [
            // Left sidebar
            { type: 'shape', name: 'Sidebar', shapeType: 'rectangle', transform: { x: 400, y: 1754, width: 800, height: 3508, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#1A1A2E', stroke: null, strokeWidth: 0, opacity: 1 }, zIndex: 1 } as Partial<ShapeElement>,
            // Profile photo
            { type: 'shape', name: 'Photo Frame', shapeType: 'circle', transform: { x: 400, y: 450, width: 350, height: 350, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#16213E', stroke: '#4ECCA3', strokeWidth: 6, opacity: 1 }, zIndex: 2 } as Partial<ShapeElement>,
            // Name
            { type: 'text', name: 'Name', content: 'JOHN DOE', transform: { x: 400, y: 700, width: 600, height: 70, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FFFFFF', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 42, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 10 } as Partial<TextElement>,
            // Title
            { type: 'text', name: 'Title', content: 'Senior UX Designer', transform: { x: 400, y: 780, width: 500, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 20, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 11 } as Partial<TextElement>,
            // Divider 1
            { type: 'shape', name: 'Divider 1', shapeType: 'rectangle', transform: { x: 400, y: 860, width: 300, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', stroke: null, strokeWidth: 0, opacity: 0.5 }, zIndex: 5 } as Partial<ShapeElement>,
            // Contact header
            { type: 'text', name: 'Contact Header', content: 'CONTACT', transform: { x: 400, y: 950, width: 400, height: 32, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 12 } as Partial<TextElement>,
            // Email
            { type: 'text', name: 'Email', content: '📧 john@example.com', transform: { x: 400, y: 1020, width: 600, height: 26, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 13 } as Partial<TextElement>,
            // Phone
            { type: 'text', name: 'Phone', content: '📱 +1 (555) 123-4567', transform: { x: 400, y: 1070, width: 600, height: 26, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 14 } as Partial<TextElement>,
            // Website
            { type: 'text', name: 'Website', content: '🌐 www.johndoe.com', transform: { x: 400, y: 1120, width: 600, height: 26, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 15 } as Partial<TextElement>,
            // Location
            { type: 'text', name: 'Location', content: '📍 New York, USA', transform: { x: 400, y: 1170, width: 600, height: 26, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 16 } as Partial<TextElement>,
            // Divider 2
            { type: 'shape', name: 'Divider 2', shapeType: 'rectangle', transform: { x: 400, y: 1260, width: 300, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', stroke: null, strokeWidth: 0, opacity: 0.5 }, zIndex: 5 } as Partial<ShapeElement>,
            // Skills header
            { type: 'text', name: 'Skills Header', content: 'SKILLS', transform: { x: 400, y: 1350, width: 400, height: 32, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 17 } as Partial<TextElement>,
            // Skills list
            { type: 'text', name: 'Skills List', content: '• UI/UX Design\n• Figma & Adobe XD\n• Prototyping\n• User Research\n• Design Systems\n• HTML/CSS', transform: { x: 400, y: 1550, width: 600, height: 280, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.8, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 18 } as Partial<TextElement>,
            // Education header
            { type: 'text', name: 'Education Header', content: 'EDUCATION', transform: { x: 400, y: 1850, width: 400, height: 32, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 19 } as Partial<TextElement>,
            // Education content
            { type: 'text', name: 'Education', content: 'Bachelor of Design\nArt Institute\n2016 - 2020', transform: { x: 400, y: 1980, width: 600, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 15, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.6, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 20 } as Partial<TextElement>,
            // Main content - Experience header
            { type: 'shape', name: 'Exp Accent', shapeType: 'rectangle', transform: { x: 900, y: 350, width: 8, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', stroke: null, strokeWidth: 0, opacity: 1 }, zIndex: 3 } as Partial<ShapeElement>,
            { type: 'text', name: 'Experience Header', content: 'WORK EXPERIENCE', transform: { x: 1540, y: 350, width: 900, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#1A1A2E', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 30 } as Partial<TextElement>,
            // Job 1
            { type: 'text', name: 'Job 1 Title', content: 'Senior UX Designer', transform: { x: 1540, y: 480, width: 900, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#1A1A2E', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 22, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 31 } as Partial<TextElement>,
            { type: 'text', name: 'Job 1 Company', content: 'Tech Innovations Inc. | 2021 - Present', transform: { x: 1540, y: 530, width: 900, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 32 } as Partial<TextElement>,
            { type: 'text', name: 'Job 1 Desc', content: '• Lead design team of 5 members\n• Created design system used across 12 products\n• Improved user retention by 35%', transform: { x: 1540, y: 640, width: 900, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#555555', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 15, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.7, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 33 } as Partial<TextElement>,
            // Job 2
            { type: 'text', name: 'Job 2 Title', content: 'UX Designer', transform: { x: 1540, y: 800, width: 900, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#1A1A2E', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 22, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 34 } as Partial<TextElement>,
            { type: 'text', name: 'Job 2 Company', content: 'Creative Agency | 2018 - 2021', transform: { x: 1540, y: 850, width: 900, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 35 } as Partial<TextElement>,
            { type: 'text', name: 'Job 2 Desc', content: '• Designed mobile apps for Fortune 500 clients\n• Conducted user research & usability testing\n• Collaborated with cross-functional teams', transform: { x: 1540, y: 960, width: 900, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#555555', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 15, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.7, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 36 } as Partial<TextElement>,
            // About header
            { type: 'shape', name: 'About Accent', shapeType: 'rectangle', transform: { x: 900, y: 1150, width: 8, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#4ECCA3', stroke: null, strokeWidth: 0, opacity: 1 }, zIndex: 3 } as Partial<ShapeElement>,
            { type: 'text', name: 'About Header', content: 'ABOUT ME', transform: { x: 1540, y: 1150, width: 900, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#1A1A2E', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 40 } as Partial<TextElement>,
            { type: 'text', name: 'About Text', content: 'Passionate UX designer with 6+ years of experience creating user-centered digital products. I combine creativity with data-driven insights to deliver exceptional user experiences.', transform: { x: 1540, y: 1300, width: 900, height: 150, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#555555', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.7, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 41 } as Partial<TextElement>,
        ],
    },
    // A4 Gradient Poster Template - ENHANCED
    {
        id: 'a4-poster-gradient',
        name: 'Gradient Poster',
        category: 'A4 Portrait',
        width: 2480,
        height: 3508,
        background: { type: 'solid', color: '#0D0D0D' },
        elements: [
            // Gradient circles
            { type: 'shape', name: 'Gradient Top', shapeType: 'circle', transform: { x: 300, y: 400, width: 1000, height: 1000, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FF006E', stroke: null, strokeWidth: 0, opacity: 0.35 }, zIndex: 1 } as Partial<ShapeElement>,
            { type: 'shape', name: 'Gradient Mid', shapeType: 'circle', transform: { x: 2100, y: 1200, width: 800, height: 800, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#8B5CF6', stroke: null, strokeWidth: 0, opacity: 0.3 }, zIndex: 1 } as Partial<ShapeElement>,
            { type: 'shape', name: 'Gradient Bottom', shapeType: 'circle', transform: { x: 2100, y: 3000, width: 1200, height: 1200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#3A86FF', stroke: null, strokeWidth: 0, opacity: 0.4 }, zIndex: 2 } as Partial<ShapeElement>,
            { type: 'shape', name: 'Gradient Left', shapeType: 'circle', transform: { x: -200, y: 2500, width: 900, height: 900, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#00D4FF', stroke: null, strokeWidth: 0, opacity: 0.25 }, zIndex: 1 } as Partial<ShapeElement>,
            // Top bar accent
            { type: 'shape', name: 'Top Bar', shapeType: 'rectangle', transform: { x: 1240, y: 80, width: 2200, height: 6, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FF006E', stroke: null, strokeWidth: 0, opacity: 0.8 }, zIndex: 3 } as Partial<ShapeElement>,
            // Event tag
            { type: 'text', name: 'Event Tag', content: '✦ ANNUAL EVENT ✦', transform: { x: 1240, y: 200, width: 800, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FF006E', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 24, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 8, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 10 } as Partial<TextElement>,
            // Main headline
            { type: 'text', name: 'Headline', content: 'DESIGN\nFESTIVAL', transform: { x: 1240, y: 700, width: 2200, height: 500, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FFFFFF', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 200, fontWeight: 900, fontStyle: 'normal', textAlign: 'center', lineHeight: 0.95, letterSpacing: -6, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 10 } as Partial<TextElement>,
            // Year with outline effect
            { type: 'text', name: 'Year', content: '2026', transform: { x: 1240, y: 1100, width: 800, height: 140, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FF006E', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 120, fontWeight: 800, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.0, letterSpacing: 30, textDecoration: 'none', textTransform: 'none' }, zIndex: 11 } as Partial<TextElement>,
            // Tagline
            { type: 'text', name: 'Tagline', content: '"Where Creativity Meets Innovation"', transform: { x: 1240, y: 1280, width: 1400, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#AAAAAA', opacity: 0.9 }, textStyle: { fontFamily: 'Inter', fontSize: 28, fontWeight: 300, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' }, zIndex: 12 } as Partial<TextElement>,
            // Divider
            { type: 'shape', name: 'Divider', shapeType: 'rectangle', transform: { x: 1240, y: 1400, width: 400, height: 3, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 0.3 }, zIndex: 5 } as Partial<ShapeElement>,
            // Featured speakers header
            { type: 'text', name: 'Speakers Header', content: 'FEATURED SPEAKERS', transform: { x: 1240, y: 1520, width: 1000, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FFFFFF', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 24, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 6, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 13 } as Partial<TextElement>,
            // Speakers
            { type: 'text', name: 'Speaker 1', content: '• Sarah Chen - Creative Director, Adobe', transform: { x: 1240, y: 1620, width: 1600, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 22, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 14 } as Partial<TextElement>,
            { type: 'text', name: 'Speaker 2', content: '• Marcus Thompson - UX Lead, Google', transform: { x: 1240, y: 1690, width: 1600, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 22, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 15 } as Partial<TextElement>,
            { type: 'text', name: 'Speaker 3', content: '• Elena Rodriguez - Brand Designer, Apple', transform: { x: 1240, y: 1760, width: 1600, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#CCCCCC', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 22, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 16 } as Partial<TextElement>,
            // Workshops section
            { type: 'text', name: 'Workshops Header', content: '20+ WORKSHOPS • 50+ SPEAKERS • 3 DAYS', transform: { x: 1240, y: 1920, width: 1800, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#3A86FF', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 26, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 17 } as Partial<TextElement>,
            // Ticket info box
            { type: 'shape', name: 'Ticket Box', shapeType: 'rounded-rectangle', transform: { x: 1240, y: 2150, width: 1000, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FF006E', stroke: null, strokeWidth: 0, opacity: 1, cornerRadius: 20 }, zIndex: 6 } as Partial<ShapeElement>,
            { type: 'text', name: 'Ticket CTA', content: 'GET YOUR TICKETS NOW', transform: { x: 1240, y: 2130, width: 800, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FFFFFF', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 18 } as Partial<TextElement>,
            { type: 'text', name: 'Ticket Price', content: 'Early Bird: $199 | Regular: $299', transform: { x: 1240, y: 2180, width: 800, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FFFFFF', opacity: 0.9 }, textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' }, zIndex: 19 } as Partial<TextElement>,
            // Date and venue
            { type: 'text', name: 'Date', content: 'MARCH 15-17, 2026', transform: { x: 1240, y: 2900, width: 1000, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#FFFFFF', opacity: 1 }, textStyle: { fontFamily: 'Poppins', fontSize: 42, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 6, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 20 } as Partial<TextElement>,
            { type: 'text', name: 'Location', content: 'JAVITS CENTER • NEW YORK CITY', transform: { x: 1240, y: 2980, width: 1200, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#888888', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 22, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 6, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 21 } as Partial<TextElement>,
            // Website
            { type: 'text', name: 'Website', content: 'www.designfestival.com', transform: { x: 1240, y: 3100, width: 800, height: 32, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#3A86FF', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 20, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' }, zIndex: 22 } as Partial<TextElement>,
            // Bottom bar
            { type: 'shape', name: 'Bottom Bar', shapeType: 'rectangle', transform: { x: 1240, y: 3428, width: 2200, height: 6, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#3A86FF', stroke: null, strokeWidth: 0, opacity: 0.8 }, zIndex: 3 } as Partial<ShapeElement>,
            // Sponsors section
            { type: 'text', name: 'Sponsors', content: 'PRESENTED BY: ADOBE • FIGMA • SKETCH • WEBFLOW', transform: { x: 1240, y: 3350, width: 1800, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' }, style: { fill: '#555555', opacity: 1 }, textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' }, zIndex: 23 } as Partial<TextElement>,
        ],
    },
    // ========== A5 PORTRAIT TEMPLATES (1748 x 2480 px at 300dpi) ==========
    // A5 Event Flyer
    {
        id: 'a5-event-flyer',
        name: 'Event Flyer',
        category: 'A5 Portrait',
        width: 1748,
        height: 2480,
        background: { type: 'solid', color: '#1C1C1C' },
        elements: [
            // Neon accent circles
            {
                type: 'shape',
                name: 'Neon Circle 1',
                shapeType: 'circle',
                transform: { x: 300, y: 400, width: 300, height: 300, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#00F5FF', stroke: null, strokeWidth: 0, opacity: 0.3 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Neon Circle 2',
                shapeType: 'circle',
                transform: { x: 1500, y: 2000, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF00FF', stroke: null, strokeWidth: 0, opacity: 0.25 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Event title
            {
                type: 'text',
                name: 'Event Title',
                content: 'NIGHT\nPARTY',
                transform: { x: 874, y: 900, width: 1400, height: 400, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 120, fontWeight: 900, fontStyle: 'normal', textAlign: 'center', lineHeight: 0.95, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Date badge
            {
                type: 'shape',
                name: 'Date Badge',
                shapeType: 'rounded-rectangle',
                transform: { x: 874, y: 1300, width: 400, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FF00FF', stroke: null, strokeWidth: 0, opacity: 1, cornerRadius: 40 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Date',
                content: 'FEB 14',
                transform: { x: 874, y: 1300, width: 300, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 32, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.0, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 11,
            } as Partial<TextElement>,
            // DJ name
            {
                type: 'text',
                name: 'DJ Name',
                content: 'FEATURING DJ SPARK',
                transform: { x: 874, y: 1500, width: 1000, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#00F5FF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 6, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 12,
            } as Partial<TextElement>,
            // Venue
            {
                type: 'text',
                name: 'Venue',
                content: 'SKYLINE CLUB',
                transform: { x: 874, y: 2200, width: 800, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#888888', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 20, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 8, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 13,
            } as Partial<TextElement>,
        ],
    },
    // A5 Restaurant Menu
    {
        id: 'a5-menu-elegant',
        name: 'Elegant Menu',
        category: 'A5 Portrait',
        width: 1748,
        height: 2480,
        background: { type: 'solid', color: '#0A0A0A' },
        elements: [
            // Gold border frame
            {
                type: 'shape',
                name: 'Border Frame',
                shapeType: 'rectangle',
                transform: { x: 874, y: 1240, width: 1648, height: 2380, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: null, stroke: '#C9A962', strokeWidth: 4, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Restaurant name
            {
                type: 'text',
                name: 'Restaurant Name',
                content: 'LA MAISON',
                transform: { x: 874, y: 300, width: 1200, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A962', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 64, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.0, letterSpacing: 12, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Tagline
            {
                type: 'text',
                name: 'Tagline',
                content: 'Fine Dining Experience',
                transform: { x: 874, y: 400, width: 800, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#888888', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 300, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Decorative divider
            {
                type: 'shape',
                name: 'Divider',
                shapeType: 'rectangle',
                transform: { x: 874, y: 500, width: 400, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A962', stroke: null, strokeWidth: 0, opacity: 0.6 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Category: Starters
            {
                type: 'text',
                name: 'Starters Header',
                content: 'STARTERS',
                transform: { x: 874, y: 650, width: 600, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#C9A962', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 6, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 12,
            } as Partial<TextElement>,
            // Menu item
            {
                type: 'text',
                name: 'Item 1',
                content: 'Truffle Risotto                                    $28',
                transform: { x: 874, y: 750, width: 1400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 13,
            } as Partial<TextElement>,
        ],
    },
    // ========== A6 PORTRAIT TEMPLATES (1240 x 1748 px at 300dpi) ==========
    // A6 Business Card Style
    {
        id: 'a6-card-minimal',
        name: 'Minimal Card',
        category: 'A6 Portrait',
        width: 1240,
        height: 1748,
        background: { type: 'solid', color: '#F5F5F0' },
        elements: [
            // Accent bar
            {
                type: 'shape',
                name: 'Accent Bar',
                shapeType: 'rectangle',
                transform: { x: 100, y: 874, width: 12, height: 1000, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D3436', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Company name
            {
                type: 'text',
                name: 'Company',
                content: 'STUDIO',
                transform: { x: 670, y: 500, width: 800, height: 70, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D3436', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 56, fontWeight: 800, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.0, letterSpacing: 8, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Tagline
            {
                type: 'text',
                name: 'Tagline',
                content: 'Creative Agency',
                transform: { x: 670, y: 580, width: 600, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#636E72', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 20, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Contact info
            {
                type: 'text',
                name: 'Contact',
                content: 'hello@studio.com\n+1 234 567 890',
                transform: { x: 670, y: 1400, width: 600, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#2D3436', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.6, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,
        ],
    },
    // A6 Invitation Card
    {
        id: 'a6-invitation-elegant',
        name: 'Elegant Invitation',
        category: 'A6 Portrait',
        width: 1240,
        height: 1748,
        background: { type: 'solid', color: '#1C1C2E' },
        elements: [
            // Decorative corner
            {
                type: 'shape',
                name: 'Corner Decor TL',
                shapeType: 'diamond',
                transform: { x: 150, y: 150, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D4AF37', stroke: null, strokeWidth: 0, opacity: 0.8 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Corner Decor BR',
                shapeType: 'diamond',
                transform: { x: 1090, y: 1598, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D4AF37', stroke: null, strokeWidth: 0, opacity: 0.8 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // You're invited
            {
                type: 'text',
                name: 'Youre Invited',
                content: "You're Invited",
                transform: { x: 620, y: 450, width: 800, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D4AF37', opacity: 1 },
                textStyle: { fontFamily: 'Great Vibes', fontSize: 48, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Event name
            {
                type: 'text',
                name: 'Event Name',
                content: 'WEDDING\nCELEBRATION',
                transform: { x: 620, y: 700, width: 1000, height: 200, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Playfair Display', fontSize: 52, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.1, letterSpacing: 6, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Divider
            {
                type: 'shape',
                name: 'Divider',
                shapeType: 'rectangle',
                transform: { x: 620, y: 900, width: 200, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D4AF37', stroke: null, strokeWidth: 0, opacity: 0.8 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            // Date and time
            {
                type: 'text',
                name: 'Date Time',
                content: 'Saturday, March 15th\n6:00 PM',
                transform: { x: 620, y: 1050, width: 800, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#CCCCCC', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 20, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.6, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,
            // Venue
            {
                type: 'text',
                name: 'Venue',
                content: 'The Grand Ballroom',
                transform: { x: 620, y: 1250, width: 800, height: 36, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#888888', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 300, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 13,
            } as Partial<TextElement>,
            // RSVP
            {
                type: 'text',
                name: 'RSVP',
                content: 'RSVP by March 1st',
                transform: { x: 620, y: 1500, width: 600, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#D4AF37', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 14,
            } as Partial<TextElement>,
        ],
    },
    // Letterhead Template - Professional Corporate Design
    {
        id: 'letterhead-corporate-1',
        name: 'Letterhead',
        category: 'Business',
        width: 1240,
        height: 1754, // A4 aspect ratio
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [
            // === HEADER SECTION ===
            // Header Background - Full width at top
            {
                type: 'shape',
                name: 'Header BG',
                shapeType: 'rectangle',
                transform: { x: 620, y: 90, width: 1240, height: 180, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A8A', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Header Accent Stripe
            {
                type: 'shape',
                name: 'Header Accent',
                shapeType: 'rectangle',
                transform: { x: 620, y: 180, width: 1240, height: 8, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#3B82F6', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Logo Placeholder Circle
            {
                type: 'shape',
                name: 'Logo BG',
                shapeType: 'circle',
                transform: { x: 140, y: 90, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            // Logo Icon (Diamond shape as placeholder)
            {
                type: 'shape',
                name: 'Logo Icon',
                shapeType: 'rectangle',
                transform: { x: 140, y: 90, width: 45, height: 45, rotation: 45, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A8A', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 4,
            } as Partial<ShapeElement>,
            // Logo Inner
            {
                type: 'shape',
                name: 'Logo Inner',
                shapeType: 'rectangle',
                transform: { x: 140, y: 90, width: 25, height: 25, rotation: 45, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#3B82F6', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 5,
            } as Partial<ShapeElement>,
            // Company Name
            {
                type: 'text',
                name: 'Company Name',
                content: 'NEXUS INNOVATIONS',
                transform: { x: 520, y: 65, width: 600, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#FFFFFF', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 34, fontWeight: 700, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 10,
            } as Partial<TextElement>,
            // Company Tagline
            {
                type: 'text',
                name: 'Tagline',
                content: 'Transforming Ideas Into Reality',
                transform: { x: 430, y: 110, width: 400, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#93C5FD', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'italic', textAlign: 'left', lineHeight: 1.2, letterSpacing: 1, textDecoration: 'none', textTransform: 'none' },
                zIndex: 11,
            } as Partial<TextElement>,
            // Header Contact - Right Side
            {
                type: 'text',
                name: 'Header Contact',
                content: '📞 +1 (555) 123-4567\n✉️ info@nexusinnovations.com\n🌐 www.nexusinnovations.com',
                transform: { x: 1050, y: 80, width: 280, height: 80, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#DBEAFE', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 11, fontWeight: 400, fontStyle: 'normal', textAlign: 'right', lineHeight: 1.8, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 12,
            } as Partial<TextElement>,

            // === DOCUMENT INFO SECTION ===
            // Date Field
            {
                type: 'text',
                name: 'Date',
                content: 'January 11, 2026',
                transform: { x: 1050, y: 260, width: 200, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#6B7280', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 13, fontWeight: 400, fontStyle: 'normal', textAlign: 'right', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 15,
            } as Partial<TextElement>,

            // === RECIPIENT SECTION ===
            {
                type: 'text',
                name: 'Recipient',
                content: 'To,\nRecipient Name\nCompany/Organization\n123 Business Street\nCity, State 12345',
                transform: { x: 225, y: 350, width: 350, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#374151', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.7, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 16,
            } as Partial<TextElement>,

            // === SUBJECT LINE ===
            {
                type: 'text',
                name: 'Subject',
                content: 'Subject: Your Subject Line Here',
                transform: { x: 350, y: 470, width: 600, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A8A', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 15, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 17,
            } as Partial<TextElement>,

            // === LETTER BODY ===
            {
                type: 'text',
                name: 'Salutation',
                content: 'Dear Sir/Madam,',
                transform: { x: 170, y: 530, width: 240, height: 28, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1F2937', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 500, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 18,
            } as Partial<TextElement>,
            // Letter Body Content
            {
                type: 'text',
                name: 'Letter Body',
                content: 'I am writing to you regarding [purpose of the letter]. We are pleased to present our proposal for your consideration.\n\nAt Nexus Innovations, we pride ourselves on delivering exceptional solutions that drive growth and innovation. Our team of experts is dedicated to understanding your unique needs and providing tailored services that exceed expectations.\n\nWe would welcome the opportunity to discuss this matter further at your earliest convenience. Please do not hesitate to contact us should you require any additional information.\n\nThank you for your time and consideration.',
                transform: { x: 620, y: 720, width: 1040, height: 300, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#374151', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.9, letterSpacing: 0.2, textDecoration: 'none', textTransform: 'none' },
                zIndex: 19,
            } as Partial<TextElement>,

            // === CLOSING ===
            {
                type: 'text',
                name: 'Closing',
                content: 'Yours sincerely,',
                transform: { x: 175, y: 930, width: 250, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1F2937', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 20,
            } as Partial<TextElement>,
            // Signature Line
            {
                type: 'shape',
                name: 'Signature Line',
                shapeType: 'rectangle',
                transform: { x: 200, y: 1020, width: 200, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#9CA3AF', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 21,
            } as Partial<ShapeElement>,
            // Signatory Name
            {
                type: 'text',
                name: 'Signatory Name',
                content: 'John Anderson\nChief Executive Officer',
                transform: { x: 200, y: 1070, width: 250, height: 50, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1F2937', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.6, letterSpacing: 0, textDecoration: 'none', textTransform: 'none' },
                zIndex: 22,
            } as Partial<TextElement>,

            // === FOOTER SECTION ===
            // Footer Divider
            {
                type: 'shape',
                name: 'Footer Divider',
                shapeType: 'rectangle',
                transform: { x: 620, y: 1660, width: 1140, height: 2, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A8A', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 25,
            } as Partial<ShapeElement>,
            // Footer Address
            {
                type: 'text',
                name: 'Footer Address',
                content: '📍 1234 Innovation Drive, Suite 500, Tech City, TC 98765  |  📞 +1 (555) 123-4567  |  ✉️ info@nexusinnovations.com',
                transform: { x: 620, y: 1695, width: 1000, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#6B7280', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 11, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.4, letterSpacing: 0.3, textDecoration: 'none', textTransform: 'none' },
                zIndex: 26,
            } as Partial<TextElement>,
            // Footer Tagline
            {
                type: 'text',
                name: 'Footer Tagline',
                content: 'Excellence • Innovation • Integrity',
                transform: { x: 620, y: 1725, width: 300, height: 20, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#3B82F6', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 10, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 27,
            } as Partial<TextElement>,

            // === DECORATIVE ELEMENTS ===
            // Side Accent Bar
            {
                type: 'shape',
                name: 'Side Accent',
                shapeType: 'rectangle',
                transform: { x: 25, y: 877, width: 8, height: 1754, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#1E3A8A', stroke: null, strokeWidth: 0, opacity: 0.1 },
                zIndex: 0,
            } as Partial<ShapeElement>,
        ],
    },
    // Tech Logo Template - Modern Branding
    {
        id: 'tech-logo-nexcore',
        name: 'Tech Logo',
        category: 'Branding',
        width: 400,
        height: 200,
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [
            // Background Container
            {
                type: 'shape',
                name: 'Logo BG',
                shapeType: 'rectangle',
                transform: { x: 200, y: 100, width: 360, height: 160, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: 'transparent', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 0,
            } as Partial<ShapeElement>,
            // Cube Icon - Main Shape
            {
                type: 'shape',
                name: 'Cube Base',
                shapeType: 'rectangle',
                transform: { x: 80, y: 100, width: 50, height: 50, rotation: 45, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#4F46E5', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            // Cube Icon - 3D Effect Top
            {
                type: 'shape',
                name: 'Cube Top',
                shapeType: 'rectangle',
                transform: { x: 80, y: 85, width: 35, height: 20, rotation: 45, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#6366F1', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            // Cube Icon - 3D Effect Side
            {
                type: 'shape',
                name: 'Cube Side',
                shapeType: 'rectangle',
                transform: { x: 95, y: 100, width: 20, height: 35, rotation: 45, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#818CF8', stroke: null, strokeWidth: 0, opacity: 1 },
                zIndex: 3,
            } as Partial<ShapeElement>,
            // Company Name - Main Title
            {
                type: 'text',
                name: 'Company Name',
                content: 'NEXCORE',
                transform: { x: 245, y: 85, width: 200, height: 45, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#111827', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 36, fontWeight: 800, fontStyle: 'normal', textAlign: 'left', lineHeight: 1, letterSpacing: -1, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 5,
            } as Partial<TextElement>,
            // Tagline
            {
                type: 'text',
                name: 'Tagline',
                content: 'FUTURE SYSTEMS',
                transform: { x: 230, y: 120, width: 180, height: 20, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#6B7280', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 11, fontWeight: 500, fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 6,
            } as Partial<TextElement>,
        ],
    },
    // Modern Event Flyer Template
    {
        id: 'modern-event-flyer',
        name: 'Modern Event Flyer',
        category: 'Events',
        width: 1080,
        height: 1920,
        background: { type: 'solid', color: '#1a1a2e' },
        elements: [
            // Background Elements using Shapes
            {
                type: 'shape',
                name: 'Circle Top Right',
                shapeType: 'circle',
                transform: { x: 900, y: 300, width: 600, height: 600, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#e94560', stroke: null, strokeWidth: 0, opacity: 0.2 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            {
                type: 'shape',
                name: 'Circle Bottom Left',
                shapeType: 'circle',
                transform: { x: 200, y: 1600, width: 500, height: 500, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#0f3460', stroke: null, strokeWidth: 0, opacity: 0.3 },
                zIndex: 1,
            } as Partial<ShapeElement>,
            // Date & Time Container
            {
                type: 'shape',
                name: 'Date Container',
                shapeType: 'rectangle',
                transform: { x: 540, y: 400, width: 400, height: 120, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#16213e', stroke: '#e94560', strokeWidth: 2, opacity: 1, cornerRadius: 10 },
                zIndex: 2,
            } as Partial<ShapeElement>,
            {
                type: 'text',
                name: 'Date Text',
                content: 'SATURDAY, NOV 18',
                transform: { x: 540, y: 385, width: 350, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 3,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Time Text',
                content: 'DOORS OPEN AT 9PM',
                transform: { x: 540, y: 425, width: 350, height: 24, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#e94560', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 18, fontWeight: 500, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 3,
            } as Partial<TextElement>,
            // Main Title
            {
                type: 'text',
                name: 'Main Title 1',
                content: 'ELECTRIC',
                transform: { x: 540, y: 700, width: 900, height: 180, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 140, fontWeight: 900, fontStyle: 'normal', textAlign: 'center', lineHeight: 0.9, letterSpacing: -2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 4,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Main Title 2',
                content: 'DREAMS',
                transform: { x: 540, y: 840, width: 900, height: 180, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: 'transparent', stroke: '#e94560', strokeWidth: 3, opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 140, fontWeight: 900, fontStyle: 'italic', textAlign: 'center', lineHeight: 0.9, letterSpacing: -2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 4,
            } as Partial<TextElement>,
            // Lineup
            {
                type: 'text',
                name: 'Featuring Label',
                content: 'FEATURING LIVE PERFORMANCES BY',
                transform: { x: 540, y: 1100, width: 600, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', opacity: 0.7 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 4, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 5,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Artist 1',
                content: 'THE NEON COLLECTIVE',
                transform: { x: 540, y: 1160, width: 800, height: 60, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 48, fontWeight: 700, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 5,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Artist 2',
                content: '+ SPECIAL GUESTS',
                transform: { x: 540, y: 1220, width: 800, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#e94560', opacity: 1 },
                textStyle: { fontFamily: 'Poppins', fontSize: 32, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 5,
            } as Partial<TextElement>,
            // Divider
            {
                type: 'shape',
                name: 'Divider Line',
                shapeType: 'rectangle',
                transform: { x: 540, y: 1350, width: 100, height: 4, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', stroke: null, strokeWidth: 0, opacity: 0.5 },
                zIndex: 6,
            } as Partial<ShapeElement>,
            // Location
            {
                type: 'text',
                name: 'Venue',
                content: 'METRO CITY HALL',
                transform: { x: 540, y: 1450, width: 600, height: 40, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', opacity: 1 },
                textStyle: { fontFamily: 'Inter', fontSize: 24, fontWeight: 600, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 7,
            } as Partial<TextElement>,
            {
                type: 'text',
                name: 'Address',
                content: '123 MAIN STREET, METROPOLIS',
                transform: { x: 540, y: 1490, width: 600, height: 30, rotation: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' },
                style: { fill: '#ffffff', opacity: 0.6 },
                textStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, textDecoration: 'none', textTransform: 'uppercase' },
                zIndex: 7,
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
                                            // Pricing Table Preview - Premium Dark Theme
                                            <div className="flex-1 flex items-center justify-center gap-[3px] p-2 bg-gradient-to-b from-[#0F0F23] to-[#1a1a2e]">
                                                {/* Starter Card */}
                                                <div className="w-[30%] h-[55%] bg-[#1E1E3F]/90 rounded-sm flex flex-col items-center justify-center px-1 py-1" style={{ boxShadow: '0 0 4px rgba(59,130,246,0.3)', border: '1px solid #3B82F6' }}>
                                                    <p className="text-white/90 text-[4px] font-medium mb-0.5">STARTER</p>
                                                    <p className="text-[#3B82F6] text-[8px] font-bold leading-none">$0</p>
                                                </div>
                                                {/* PRO Card - Featured */}
                                                <div className="w-[34%] h-[70%] bg-[#1E1E3F] rounded-sm flex flex-col items-center justify-center px-1 py-1" style={{ boxShadow: '0 0 8px rgba(139,92,246,0.4)', border: '2px solid #8B5CF6' }}>
                                                    <p className="text-[#A855F7] text-[3px] font-bold">★ POPULAR</p>
                                                    <p className="text-white text-[4px] font-medium">PRO</p>
                                                    <p className="text-[#A855F7] text-[10px] font-bold leading-none">$49</p>
                                                </div>
                                                {/* Enterprise Card */}
                                                <div className="w-[30%] h-[55%] bg-[#1E1E3F]/90 rounded-sm flex flex-col items-center justify-center px-1 py-1" style={{ boxShadow: '0 0 4px rgba(249,115,22,0.3)', border: '1px solid #F97316' }}>
                                                    <p className="text-white/90 text-[3px] font-medium mb-0.5">ENTERPRISE</p>
                                                    <p className="text-[#F97316] text-[8px] font-bold leading-none">$149</p>
                                                </div>
                                            </div>
                                        ) : template.id === 'doctor-profile-1' ? (
                                            // Doctor Profile Preview - Modern Teal Design
                                            <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
                                                {/* Teal Header */}
                                                <div className="w-full h-[45%] bg-[#0D9488] flex flex-col items-center justify-center relative">
                                                    {/* Empty Photo Circle */}
                                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0D9488]"></div>
                                                </div>
                                                {/* Doctor Name & Specialty */}
                                                <div className="px-2 py-1 text-center bg-[#F8FAFC]">
                                                    <p className="font-bold text-[5px] text-gray-800">Name</p>
                                                    <p className="text-[#0D9488] text-[3px]">Orthopedic Surgeon</p>
                                                </div>
                                                {/* Stats Row */}
                                                <div className="flex justify-around px-1 py-1 bg-white border-y border-gray-200">
                                                    <div className="text-center">
                                                        <p className="text-[#0D9488] text-[5px] font-bold">15+</p>
                                                        <p className="text-gray-500 text-[2px]">Years</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[#0D9488] text-[5px] font-bold">5000+</p>
                                                        <p className="text-gray-500 text-[2px]">Patients</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[#0D9488] text-[5px] font-bold">4.9</p>
                                                        <p className="text-gray-500 text-[2px]">Rating</p>
                                                    </div>
                                                </div>
                                                {/* CTA Button */}
                                                <div className="flex-1 flex items-center justify-center px-2">
                                                    <div className="bg-[#0D9488] px-3 py-1 rounded">
                                                        <p className="text-white text-[3px] font-medium">Book Appointment</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'food-blog-1' ? (
                                            // Food Blog Preview
                                            <div className="flex-1 relative overflow-hidden">
                                                {/* Food background image */}
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=60)' }}
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
                                                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60)' }}
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

                                        ) : template.id === 'cyber-monday-1' ? (
                                            // Cyber Monday Preview - Landscape
                                            <div className="flex-1 flex items-center justify-center bg-[#09090B]">
                                                <div className="w-[95%] aspect-video relative overflow-hidden bg-[#09090B] border border-[#22D3EE]/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                                                    {/* Glow */}
                                                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(34,211,238,0.15), transparent 70%)' }}></div>
                                                    {/* Text */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <p className="text-[#EC4899] text-[10px] font-black leading-none drop-shadow-[0_0_2px_rgba(236,72,153,0.5)]" style={{ fontFamily: 'Inter' }}>CYBER</p>
                                                        <p className="text-white text-[10px] font-black leading-none mt-[-1px]" style={{ fontFamily: 'Inter' }}>MONDAY</p>
                                                        {/* Discount */}
                                                        <div className="mt-1.5 bg-[#FACC15] -rotate-2 px-1 shadow-[1px_1px_0_rgba(0,0,0,1)]">
                                                            <p className="text-black text-[3px] font-bold" style={{ fontFamily: 'Inter' }}>UP TO 70% OFF</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'art-exhibit-1' ? (
                                            // Art Exhibit Preview - Square
                                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                                <div className="w-[90%] aspect-square relative overflow-hidden bg-[#F3F4F6] shadow-sm border border-gray-200">
                                                    {/* Shapes */}
                                                    <div className="absolute -right-2 top-2 w-12 h-12 rounded-full bg-[#EF4444]"></div>
                                                    <div className="absolute left-2 bottom-6 w-8 h-16 bg-black"></div>
                                                    {/* Image */}
                                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] border-2 border-white shadow-sm overflow-hidden">
                                                        <img src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=200&q=60" className="w-full h-full object-cover grayscale contrast-125" alt="Art" />
                                                    </div>
                                                    {/* Text */}
                                                    <div className="absolute bottom-1 w-full text-center">
                                                        <p className="text-black text-[6px] leading-none" style={{ fontFamily: 'Playfair Display' }}>MODERN</p>
                                                        <p className="text-black text-[6px] leading-none" style={{ fontFamily: 'Playfair Display' }}>ABSTRACT</p>
                                                        <p className="text-black/60 text-[3px] mt-0.5 tracking-widest font-sans">JULY 20 - AUG 30</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'party-event-neon' ? (
                                            // Party Event Neon Preview
                                            <div className="flex-1 relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, #1a0a2e, #0d1b2a, #0a0a12)' }}>
                                                {/* Decorative glow circles */}
                                                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-[#FF1493]/20" />
                                                <div className="absolute right-1 top-4 w-5 h-5 rounded-full bg-[#00BFFF]/15" />
                                                <div className="absolute left-1 bottom-4 w-7 h-7 rounded-full bg-[#8A2BE2]/20" />
                                                {/* Full neon frame */}
                                                <div className="absolute top-1 left-1.5 right-1.5 h-[1px] bg-white" style={{ boxShadow: '0 0 6px 2px #00BFFF, 0 0 12px 4px #00BFFF' }} />
                                                <div className="absolute bottom-1 left-1.5 right-1.5 h-[1px] bg-white" style={{ boxShadow: '0 0 6px 2px #00BFFF, 0 0 12px 4px #00BFFF' }} />
                                                <div className="absolute top-1 bottom-1 left-1.5 w-[1px] bg-white" style={{ boxShadow: '0 0 6px 2px #00BFFF, 0 0 12px 4px #00BFFF' }} />
                                                <div className="absolute top-1 bottom-1 right-1.5 w-[1px] bg-white" style={{ boxShadow: '0 0 6px 2px #00BFFF, 0 0 12px 4px #00BFFF' }} />
                                                {/* Text */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
                                                    <p className="text-[#FFD700] text-[3px] tracking-wider">★ EXCLUSIVE EVENT ★</p>
                                                    <p className="text-white text-[5px] tracking-wider mt-0.5" style={{ fontFamily: 'serif' }}>BHAILU'S</p>
                                                    <p className="text-[#FF6B9D] text-[2px] tracking-widest">PRESENTS</p>
                                                    <p className="text-white text-[8px] font-black mt-0.5 leading-none" style={{ textShadow: '0 0 8px #00BFFF' }}>THE BIG BANG</p>
                                                    <p className="text-white text-[11px] font-black tracking-[2px] leading-none" style={{ textShadow: '0 0 10px #FF1493' }}>PARTY</p>
                                                    <p className="text-[#FFD700] text-[3px] font-bold mt-0.5">✨ SECURE YOUR SPOT ✨</p>
                                                </div>
                                            </div>
                                        ) : template.id === 'certificate-achievement-1' ? (
                                            // Certificate of Achievement Preview - Elegant Navy & Gold
                                            <div className="flex-1 relative overflow-hidden bg-[#FDFBF7]">
                                                {/* Outer border */}
                                                <div className="absolute inset-[2px] border-2 border-[#1E3A5F]" />
                                                {/* Inner border */}
                                                <div className="absolute inset-[5px] border border-[#C9A227]" />
                                                {/* Corner ornaments */}
                                                <div className="absolute top-[2px] left-[2px] w-2 h-2 rounded-full bg-[#C9A227] flex items-center justify-center">
                                                    <div className="w-1 h-1 rounded-full bg-[#1E3A5F]" />
                                                </div>
                                                <div className="absolute top-[2px] right-[2px] w-2 h-2 rounded-full bg-[#C9A227] flex items-center justify-center">
                                                    <div className="w-1 h-1 rounded-full bg-[#1E3A5F]" />
                                                </div>
                                                <div className="absolute bottom-[2px] left-[2px] w-2 h-2 rounded-full bg-[#C9A227] flex items-center justify-center">
                                                    <div className="w-1 h-1 rounded-full bg-[#1E3A5F]" />
                                                </div>
                                                <div className="absolute bottom-[2px] right-[2px] w-2 h-2 rounded-full bg-[#C9A227] flex items-center justify-center">
                                                    <div className="w-1 h-1 rounded-full bg-[#1E3A5F]" />
                                                </div>
                                                {/* Header ribbon */}
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1E3A5F] px-2 py-[1px]">
                                                    <p className="text-[#C9A227] text-[2px]">✦ OFFICIAL ✦</p>
                                                </div>
                                                {/* Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
                                                    {/* Title */}
                                                    <p className="text-[#1E3A5F] text-[9px] italic" style={{ fontFamily: 'serif' }}>Certificate</p>
                                                    {/* Decorative line */}
                                                    <div className="flex items-center gap-0.5 mt-0.5">
                                                        <div className="w-3 h-[0.5px] bg-[#C9A227]" />
                                                        <div className="w-1 h-1 bg-[#C9A227] rotate-45" />
                                                        <div className="w-3 h-[0.5px] bg-[#C9A227]" />
                                                    </div>
                                                    <p className="text-[#1E3A5F] text-[4px] italic mt-0.5" style={{ fontFamily: 'serif' }}>of Achievement</p>
                                                    {/* Name */}
                                                    <p className="text-[#1E3A5F] text-[6px] mt-1" style={{ fontFamily: 'cursive' }}>John Smith</p>
                                                    <div className="w-10 h-[0.5px] bg-[#C9A227]/70 mt-0.5" />
                                                    {/* Seal */}
                                                    <div className="mt-1.5 w-5 h-5 rounded-full bg-[#C9A227] flex items-center justify-center">
                                                        <div className="w-4 h-4 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                                                            <span className="text-[#C9A227] text-[5px]">★</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'letterhead-corporate-1' ? (
                                            // Letterhead Corporate Preview - Professional Design
                                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                                <div className="w-[92%] h-[96%] relative overflow-hidden bg-white shadow-sm border border-gray-100">
                                                    {/* Header */}
                                                    <div className="w-full bg-[#1E3A8A] py-1.5 px-1.5 flex items-center gap-1">
                                                        {/* Logo */}
                                                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-[#1E3A8A] rotate-45"></div>
                                                        </div>
                                                        {/* Company Info */}
                                                        <div className="flex-1">
                                                            <p className="text-white text-[5px] font-bold tracking-[0.5px]">NEXUS INNOVATIONS</p>
                                                            <p className="text-blue-200 text-[2.5px] italic">Transforming Ideas Into Reality</p>
                                                        </div>
                                                        {/* Contact */}
                                                        <div className="text-right">
                                                            <p className="text-blue-100 text-[2px]">📞 +1 (555) 123-4567</p>
                                                            <p className="text-blue-100 text-[2px]">✉️ info@nexus.com</p>
                                                        </div>
                                                    </div>
                                                    {/* Accent Stripe */}
                                                    <div className="w-full h-[2px] bg-[#3B82F6]"></div>
                                                    {/* Date */}
                                                    <p className="text-gray-400 text-[2.5px] text-right pr-1.5 mt-1">January 11, 2026</p>
                                                    {/* Letter Content */}
                                                    <div className="px-1.5 mt-1">
                                                        <p className="text-gray-500 text-[2.5px]">To, Recipient Name</p>
                                                        <p className="text-[#1E3A8A] text-[3px] font-semibold mt-1">Subject: Your Subject Here</p>
                                                        <p className="text-gray-700 text-[2.5px] mt-0.5">Dear Sir/Madam,</p>
                                                        <div className="mt-0.5 space-y-[1px]">
                                                            <div className="w-full h-[1px] bg-gray-200"></div>
                                                            <div className="w-[80%] h-[1px] bg-gray-200"></div>
                                                            <div className="w-[90%] h-[1px] bg-gray-200"></div>
                                                        </div>
                                                    </div>
                                                    {/* Signature Area */}
                                                    <div className="px-1.5 mt-2">
                                                        <p className="text-gray-600 text-[2.5px]">Yours sincerely,</p>
                                                        <div className="w-6 h-[0.5px] bg-gray-300 mt-1"></div>
                                                        <p className="text-gray-700 text-[2.5px] font-semibold mt-0.5">John Anderson</p>
                                                    </div>
                                                    {/* Footer */}
                                                    <div className="absolute bottom-0.5 left-0 right-0 px-1.5">
                                                        <div className="w-full h-[0.5px] bg-[#1E3A8A]"></div>
                                                        <p className="text-gray-400 text-[2px] text-center mt-[1px]">📍 1234 Innovation Drive | 📞 +1 (555) 123-4567</p>
                                                        <p className="text-[#3B82F6] text-[1.5px] text-center tracking-wide">EXCELLENCE • INNOVATION • INTEGRITY</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'tech-logo-nexcore' ? (
                                            // Tech Logo Preview
                                            <div className="flex-1 flex items-center justify-center bg-white">
                                                <div className="flex items-center gap-2 p-3">
                                                    {/* Cube Icon */}
                                                    <div className="relative w-6 h-6">
                                                        <div className="absolute inset-0 bg-[#4F46E5] rotate-45 rounded-sm"></div>
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#6366F1] rotate-45 rounded-sm"></div>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-[#818CF8] rotate-45 rounded-sm"></div>
                                                    </div>
                                                    {/* Text */}
                                                    <div className="flex flex-col">
                                                        <p className="text-[#111827] text-[10px] font-extrabold tracking-tight leading-none">NEXCORE</p>
                                                        <p className="text-gray-500 text-[4px] tracking-[1px] mt-0.5">FUTURE SYSTEMS</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : template.id === 'modern-event-flyer' ? (
                                            // Modern Event Flyer Preview
                                            <div className="flex-1 relative overflow-hidden bg-[#1a1a2e]">
                                                {/* Circles */}
                                                <div className="absolute right-0 top-0 w-24 h-24 bg-[#e94560]/20 rounded-full translate-x-1/3 -translate-y-1/3" />
                                                <div className="absolute left-0 bottom-0 w-20 h-20 bg-[#0f3460]/30 rounded-full -translate-x-1/3 translate-y-1/3" />
                                                {/* Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                                    <div className="border border-[#e94560] rounded px-2 py-0.5 mb-2">
                                                        <p className="text-white text-[4px] font-bold">NOV 18</p>
                                                    </div>
                                                    <p className="text-white text-[12px] font-black leading-none tracking-tighter">ELECTRIC</p>
                                                    <p className="text-transparent text-[12px] font-black leading-none tracking-tighter italic" style={{ WebkitTextStroke: '0.5px #e94560' }}>DREAMS</p>
                                                    <p className="text-white/70 text-[3px] mt-2 tracking-widest">LIVE MUSIC</p>
                                                </div>
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
