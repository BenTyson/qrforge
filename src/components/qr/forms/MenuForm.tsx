'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogoUploader } from '@/components/qr/LogoUploader';
import { DietaryTagSelector } from '@/components/qr/forms/DietaryTagSelector';
import type { MenuContent } from '@/lib/qr/types';

interface MenuFormProps {
  content: Partial<MenuContent>;
  onChange: (content: MenuContent) => void;
}

type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free';

type MenuItem = {
  name: string;
  description?: string;
  price: string;
  image?: string;
  dietary?: DietaryTag[];
};

type MenuCategory = {
  name: string;
  items: MenuItem[];
};

export function MenuForm({ content, onChange }: MenuFormProps) {
  const categories: MenuCategory[] = content.categories || [
    { name: '', items: [{ name: '', price: '' }] },
  ];

  const handleFieldChange = (field: keyof MenuContent, value: string) => {
    onChange({
      type: 'menu',
      restaurantName: content.restaurantName || '',
      categories: content.categories || [],
      logoUrl: content.logoUrl,
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  const handleCategoryNameChange = (categoryIndex: number, name: string) => {
    const newCategories = [...categories];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], name };
    onChange({
      type: 'menu',
      restaurantName: content.restaurantName || '',
      categories: newCategories,
      logoUrl: content.logoUrl,
      accentColor: content.accentColor,
    });
  };

  const handleItemChange = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof MenuItem,
    value: string | DietaryTag[] | undefined
  ) => {
    const newCategories = [...categories];
    const newItems = [...newCategories[categoryIndex].items];
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], items: newItems };
    onChange({
      type: 'menu',
      restaurantName: content.restaurantName || '',
      categories: newCategories,
      logoUrl: content.logoUrl,
      accentColor: content.accentColor,
    });
  };

  const addCategory = () => {
    onChange({
      type: 'menu',
      restaurantName: content.restaurantName || '',
      categories: [...categories, { name: '', items: [{ name: '', price: '' }] }],
      logoUrl: content.logoUrl,
      accentColor: content.accentColor,
    });
  };

  const removeCategory = (categoryIndex: number) => {
    if (categories.length > 1) {
      const newCategories = categories.filter((_, i) => i !== categoryIndex);
      onChange({
        type: 'menu',
        restaurantName: content.restaurantName || '',
        categories: newCategories,
        logoUrl: content.logoUrl,
        accentColor: content.accentColor,
      });
    }
  };

  const addItem = (categoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      items: [...newCategories[categoryIndex].items, { name: '', price: '' }],
    };
    onChange({
      type: 'menu',
      restaurantName: content.restaurantName || '',
      categories: newCategories,
      logoUrl: content.logoUrl,
      accentColor: content.accentColor,
    });
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    if (newCategories[categoryIndex].items.length > 1) {
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        items: newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex),
      };
      onChange({
        type: 'menu',
        restaurantName: content.restaurantName || '',
        categories: newCategories,
        logoUrl: content.logoUrl,
        accentColor: content.accentColor,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Restaurant Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="menuRestaurant">Restaurant Name *</Label>
          <Input
            id="menuRestaurant"
            type="text"
            placeholder="Your Restaurant"
            value={content.restaurantName || ''}
            onChange={(e) => handleFieldChange('restaurantName', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div className="col-span-2">
          <Label>Restaurant Logo (optional)</Label>
          <LogoUploader
            value={content.logoUrl}
            onChange={(url) => handleFieldChange('logoUrl', url || '')}
            placeholder="Upload restaurant logo"
            className="mt-1"
          />
        </div>
      </div>

      {/* Menu Categories */}
      <div>
        <Label className="mb-3 block">Menu Categories</Label>
        <div className="space-y-4">
          {categories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-4 bg-secondary/20">
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Category name (e.g., Appetizers)"
                  value={category.name}
                  onChange={(e) => handleCategoryNameChange(categoryIndex, e.target.value)}
                  className="flex-1 bg-secondary/50 font-medium"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCategory(categoryIndex)}
                  disabled={categories.length <= 1}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </Button>
              </div>

              {/* Items in category */}
              <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                {category.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="p-3 bg-secondary/30">
                    {/* Row 1: Name, Price, Delete */}
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(categoryIndex, itemIndex, 'name', e.target.value)
                        }
                        className="flex-1 bg-secondary/50"
                      />
                      <Input
                        type="text"
                        placeholder="$0.00"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(categoryIndex, itemIndex, 'price', e.target.value)
                        }
                        className="w-24 bg-secondary/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(categoryIndex, itemIndex)}
                        disabled={category.items.length <= 1}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </Button>
                    </div>

                    {/* Row 2: Description */}
                    <textarea
                      placeholder="Item description (optional)"
                      value={item.description || ''}
                      onChange={(e) =>
                        handleItemChange(categoryIndex, itemIndex, 'description', e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                    />

                    {/* Row 3: Image & Dietary Tags */}
                    <div className="flex gap-3 mt-2 items-start">
                      <div className="flex-1">
                        <LogoUploader
                          value={item.image}
                          onChange={(url) =>
                            handleItemChange(categoryIndex, itemIndex, 'image', url)
                          }
                          placeholder="Add item photo"
                        />
                      </div>
                      <div className="shrink-0">
                        <p className="text-xs text-muted-foreground mb-1.5">Dietary</p>
                        <DietaryTagSelector
                          selected={item.dietary || []}
                          onChange={(tags) =>
                            handleItemChange(categoryIndex, itemIndex, 'dietary', tags)
                          }
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addItem(categoryIndex)}
                  className="text-xs"
                >
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Item
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCategory}
          className="mt-3"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Category
        </Button>
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="menuAccent">Accent Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="menuAccent"
            type="color"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleFieldChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50"
          />
          <Input
            type="text"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleFieldChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50"
            placeholder="#14b8a6"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        Create a digital menu for your restaurant. Add photos and dietary tags to make your menu more appealing.
      </p>
    </div>
  );
}
