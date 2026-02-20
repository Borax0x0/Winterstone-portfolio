import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddOn extends Document {
    name: string;
    description: string;
    price: number;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const AddOnSchema: Schema<IAddOn> = new Schema(
    {
        name: { 
            type: String, 
            required: true,
            trim: true
        },
        description: { 
            type: String, 
            default: '',
            trim: true
        },
        price: { 
            type: Number, 
            required: true,
            min: 0
        },
        isActive: { 
            type: Boolean, 
            default: true 
        },
        displayOrder: { 
            type: Number, 
            default: 0 
        },
    },
    {
        timestamps: true,
    }
);

AddOnSchema.index({ isActive: 1, displayOrder: 1 });

const AddOn: Model<IAddOn> = mongoose.models.AddOn || mongoose.model<IAddOn>('AddOn', AddOnSchema);

export default AddOn;
