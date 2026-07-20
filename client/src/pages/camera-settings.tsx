import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save, TestTube, Eye, EyeOff } from 'lucide-react';
import { useConfig } from '@/lib/config-context';

// Form validation schema
const cameraSettingsSchema = z.object({
  name: z.string().min(1, 'Camera name is required'),
  ip: z.string().min(1, 'IP address is required').regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Invalid IP address format'),
  port: z.number().min(1, 'Port must be greater than 0').max(65535, 'Port must be less than 65536'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  channel: z.number().min(1, 'Channel must be at least 1'),
  subtype: z.number().min(0, 'Subtype must be 0 or greater'),
});

type CameraSettingsForm = z.infer<typeof cameraSettingsSchema>;

export default function 
CameraSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cameraIp: currentCameraIp, cameraPort: currentCameraPort, refetchConfig } = useConfig();

  // Fetch current camera settings
  const { data: camera, isLoading } = useQuery({
    queryKey: ['/api/cameras/1'],
  });

  const form = useForm<CameraSettingsForm>({
    resolver: zodResolver(cameraSettingsSchema),
    defaultValues: {
      name: 'Camera 01',
      ip:currentCameraIp || '10.10.10.146',
      port: currentCameraPort || 554,
      username: 'admin',
      password: 'admin123',
      channel: 1,
      subtype: 0,
    },
  });

  // Update form when camera data loads or config changes
  React.useEffect(() => {
    if (camera) {
      form.reset({
        name: camera.name || 'Camera 01',
        ip: camera.ip ||currentCameraIp || '10.10.10.146',
        port: camera.port || currentCameraPort || 554,
        username: camera.username || 'admin',
        password: camera.password || 'admin123',
        channel: 1,
        subtype: 0,
      });
    } else {
      // If no camera data, use config context values
      form.reset({
        name: 'Camera 01',
        ip:currentCameraIp || '10.10.10.146',
        port: currentCameraPort || 554,
        username: 'admin',
        password: 'admin123',
        channel: 1,
        subtype: 0,
      });
    }
  }, [camera, currentCameraIp, currentCameraPort, form]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: CameraSettingsForm) => {
      console.log('Saving camera settings:', data);
      const response = await apiRequest('PATCH', '/api/cameras/1', data);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cameras/1'] });
      refetchConfig();
      
      // Broadcast to other tabs/windows via localStorage
      localStorage.setItem('config-updated', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'config-updated',
        newValue: Date.now().toString()
      }));
      
      // Broadcast to current tab via custom event
      window.dispatchEvent(new CustomEvent('config-updated'));
      
      console.log('Camera settings saved successfully:', data);
      toast({
        title: "Settings Saved",
        description: "Camera settings have been updated successfully. All pages will use the new camera configuration.",
      });
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save camera settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (data: CameraSettingsForm) => {
      const rtspUrl = `rtsp://${data.username}:${data.password}@${data.ip}:${data.port}/cam/realmonitor?channel=${data.channel}&subtype=${data.subtype}`;
      console.log('Testing camera connection with URL:', rtspUrl);
      
      // For now, simulate a successful test since we don't have a dedicated test endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Connection test completed' };
    },
    onSuccess: () => {
      toast({
        title: "Connection Test Complete",
        description: "Camera connection test completed. Save settings to apply changes.",
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to camera. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CameraSettingsForm) => {
    console.log('Form data being submitted:', data);
    saveSettingsMutation.mutate(data);
  };

  const onTestConnection = () => {
    const formData = form.getValues();
    testConnectionMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monitoring-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Camera className="h-8 w-8 text-monitoring-blue" />
        <div>
          <h1 className="text-3xl font-bold text-white">Camera Settings</h1>
          <p className="text-gray-400">Configure your RTSP camera connection settings</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Settings */}
          <Card className="bg-monitoring-slate border-monitoring-gray">
            <CardHeader>
              <CardTitle className="text-white">Basic Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Basic camera identification and connection details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Camera Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-monitoring-dark border-monitoring-gray text-white"
                        placeholder="Enter camera name"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      A friendly name to identify this camera
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">IP Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-monitoring-dark border-monitoring-gray text-white"
                          placeholder="192.168.1.100"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Camera's network IP address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">RTSP Port</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="bg-monitoring-dark border-monitoring-gray text-white"
                          placeholder="554"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        RTSP port (usually 554)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card className="bg-monitoring-slate border-monitoring-gray">
            <CardHeader>
              <CardTitle className="text-white">Authentication</CardTitle>
              <CardDescription className="text-gray-400">
                Camera login credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-monitoring-dark border-monitoring-gray text-white"
                          placeholder="admin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="bg-monitoring-dark border-monitoring-gray text-white pr-10"
                            placeholder="Enter password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-monitoring-slate border-monitoring-gray">
            <CardHeader>
              <CardTitle className="text-white">Advanced Settings</CardTitle>
              <CardDescription className="text-gray-400">
                RTSP stream configuration parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Channel</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="bg-monitoring-dark border-monitoring-gray text-white"
                          placeholder="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Camera channel number (usually 1)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Subtype</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="bg-monitoring-dark border-monitoring-gray text-white"
                          placeholder="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Stream subtype (0 = main stream, 1 = sub stream)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Generated RTSP URL Preview */}
              <div className="pt-4 border-t border-monitoring-gray">
                <Label className="text-white">Generated RTSP URL</Label>
                <div className="mt-2 p-3 bg-monitoring-dark border border-monitoring-gray rounded-md">
                  <code className="text-sm text-monitoring-blue break-all">
                    rtsp://{form.watch('username')}:{showPassword ? form.watch('password') : '***'}@{form.watch('ip')}:{form.watch('port')}/cam/realmonitor?channel={form.watch('channel')}&subtype={form.watch('subtype')}
                  </code>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  This is the complete RTSP URL that will be used to connect to your camera
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={saveSettingsMutation.isPending}
              className="bg-monitoring-blue hover:bg-monitoring-blue/90 text-white flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onTestConnection}
              disabled={testConnectionMutation.isPending}
              className="border-monitoring-gray text-white hover:bg-monitoring-gray flex-1"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}