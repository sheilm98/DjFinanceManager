import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

// Profile schema for validation
const profileSchema = z.object({
  stageName: z.string().min(2, { message: "Stage name must be at least 2 characters" }).optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      stageName: '',
      email: '',
      phone: '',
      location: '',
    }
  });
  
  // Set form values from user data
  useEffect(() => {
    if (user) {
      form.reset({
        stageName: user.stageName || '',
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
      });
      
      // Set logo preview if user has a logo
      if (user.logoUrl) {
        setLogoPreview(user.logoUrl);
      }
    }
  }, [user, form]);
  
  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload logo to server
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      return await apiRequest('POST', '/api/user/logo', formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Logo uploaded',
        description: 'Your logo has been uploaded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error uploading logo',
        description: error.message || 'There was an error uploading your logo',
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return apiRequest('PUT', '/api/user', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message || 'There was an error updating your profile',
      });
    },
  });
  
  const onSubmit = async (data: ProfileFormValues) => {
    await updateMutation.mutateAsync(data);
    
    // Upload logo if a new one was selected
    if (logoFile) {
      await uploadLogoMutation.mutateAsync(logoFile);
    }
  };
  
  // Trigger file input click
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };
  
  // Get initials for the avatar
  const getInitials = (name: string) => {
    if (!name) return 'DJ';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start">
        <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoChange}
            accept="image/*"
            className="hidden"
          />
          {logoPreview ? (
            <div className="relative w-24 h-24 mb-2 rounded-md overflow-hidden border-2 border-dashed border-primary/30">
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-secondary rounded-md flex items-center justify-center text-3xl font-semibold mb-2">
              {getInitials(user.stageName || '')}
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleLogoClick}
              type="button"
            >
              {logoPreview ? 'Change Logo' : 'Add Logo'}
            </Button>
            {logoPreview && (
              <p className="text-xs text-center text-muted-foreground">
                Your logo will appear on invoices
              </p>
            )}
          </div>
        </div>
        
        <div className="flex-grow w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="stageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage Name / DJ Name</FormLabel>
                      <FormControl>
                        <Input placeholder="DJ Blaze" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Los Angeles, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
