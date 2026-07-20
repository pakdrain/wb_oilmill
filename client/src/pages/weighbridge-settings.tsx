import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Scale, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfig } from "@/lib/config-context";

// ✅ Import ComPort Context
import { useComPort } from "@/Comportcontext";

const weighbridgeSettingsSchema = z.object({
  comPort: z.string().min(1, "COM port is required"),   // ✅ required
  baudRate: z.coerce.number().min(1, "Baud rate is required"), // ✅ required
  dataBits: z.coerce.number().min(5).max(8),            // ✅ required
  parity: z.enum(["none", "odd", "even"]),              // ✅ required
  stopBits: z.coerce.number().min(1).max(2),            // ✅ required
  unit: z.enum(["kg", "g", "lb"]).optional(),
  precision: z.coerce.number().min(0).max(3).optional(),
  tareValue: z.coerce.number().min(0).optional(),
  autoTare: z.boolean().optional(),
  calibrationFactor: z.coerce.number().min(0.1).max(10).optional(),
});

type WeighbridgeSettingsForm = z.infer<typeof weighbridgeSettingsSchema>;

// ✅ Mapper: backend -> frontend (no hardcoded defaults)
const mapApiSettingsToForm = (apiData: any): WeighbridgeSettingsForm => ({
  comPort: apiData.comPort ?? apiData.port ?? "",
  baudRate: apiData.baudRate ?? apiData.baud_rate ?? undefined,
  dataBits: apiData.dataBits ?? apiData.data_bits ?? undefined,
  stopBits: apiData.stopBits ?? apiData.stop_bits ?? undefined,
  parity: apiData.parity ?? undefined,
  unit: apiData.unit ?? undefined,
  precision: apiData.precision ?? undefined,
  tareValue: apiData.tareValue ?? apiData.tare_value ?? undefined,
  autoTare: apiData.autoTare ?? apiData.auto_tare ?? undefined,
  calibrationFactor: apiData.calibrationFactor ?? apiData.calibration_factor ?? undefined,
});

interface WeighbridgeStatus {
  connected: boolean;
  currentWeight: string;
  currentUnit: string;
  port: string | null;
  baudRate: string | null;
  dataBits?: number | null;
  stopBits?: number | null;
  parity?: "none" | "odd" | "even" | null;
}

export default function WeighbridgeSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refetchConfig } = useConfig();

  // ✅ Global COM port context
  const { setComPort } = useComPort();

  // --- Settings Query ---
  const { data: savedSettings } = useQuery<WeighbridgeSettingsForm>({
    queryKey: ["/api/weighbridge-settings"],
    queryFn: async () => {
      const res = await fetch("/api/weighbridge-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const apiData = await res.json();
      return mapApiSettingsToForm(apiData);
    },
  });

  // --- Status Query ---
  const { data: weightStatus } = useQuery<WeighbridgeStatus>({
    queryKey: ["/api/weight/status"],
    queryFn: async () => {
      const res = await fetch("/api/weight/status");
      if (!res.ok) throw new Error("Failed to fetch weight status");
      return res.json() as Promise<WeighbridgeStatus>;
    },
    refetchInterval: 2000,
  });

  // --- Form ---
  const form = useForm<WeighbridgeSettingsForm>({
    resolver: zodResolver(weighbridgeSettingsSchema),
    defaultValues: {
      comPort: "",
      baudRate: undefined,
      dataBits: undefined,
      stopBits: undefined,
      parity: undefined,
      unit: undefined,
      precision: undefined,
      tareValue: undefined,
      autoTare: undefined,
      calibrationFactor: undefined,
    },
  });

  const [justSaved, setJustSaved] = useState(false);

  // Reset form from DB values if not just saved
  useEffect(() => {
    if (!justSaved && savedSettings) {
      form.reset(savedSettings);
    }
  }, [savedSettings, form, justSaved]);

  // --- Save Mutation ---
  const saveMutation = useMutation({
    mutationFn: async (data: WeighbridgeSettingsForm) => {
      const res = await fetch("/api/weighbridge-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Weighbridge settings updated successfully.",
      });

      // ✅ Blank reset
      form.reset({
        comPort: "",
        baudRate: undefined,
        dataBits: undefined,
        stopBits: undefined,
        parity: undefined,
        unit: undefined,
        precision: undefined,
        tareValue: undefined,
        autoTare: undefined,
        calibrationFactor: undefined,
      });

      // ✅ Ye flag set karo taake savedSettings se overwrite na ho
      setJustSaved(true);

      queryClient.invalidateQueries({ queryKey: ["/api/weighbridge-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weight/status"] });
    },

    onError: () => {
      toast({
        title: "Failed to Save",
        description: "Could not update weighbridge settings.",
        variant: "destructive",
      });
    },
  });

  // --- Connect Mutation ---
  const connectMutation = useMutation({
    mutationFn: async (data: {
      comPort: string;
      baudRate: number;
      dataBits: number;
      stopBits: number;
      parity: "none" | "odd" | "even";
    }) => {
      const res = await fetch("/api/weight/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      // ✅ Update global context with selected COM port
      setComPort(variables.comPort);

      toast({
        title: "Connection Successful",
        description: "Successfully connected to weighbridge.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weight/status"] });
      refetchConfig();
      localStorage.setItem("config-updated", Date.now().toString());
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "config-updated",
          newValue: Date.now().toString(),
        })
      );
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to weighbridge. Check your settings.",
        variant: "destructive",
      });
    },
  });

  // --- Tare Mutation ---
  const tareMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/weight/tare", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tare Applied",
        description: "Scale has been zeroed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Tare Failed",
        description: "Failed to apply tare. Check connection.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WeighbridgeSettingsForm) => {
    saveMutation.mutate(data, {
      onSuccess: () => {
        // ✅ Global context update
        setComPort(data.comPort);

        // ✅ Connect after save
        connectMutation.mutate({
          comPort: data.comPort,
          baudRate: data.baudRate,
          dataBits: data.dataBits,
          stopBits: data.stopBits,
          parity: data.parity,
        });
      },
    });
  };

  const handleTare = () => {
    tareMutation.mutate();
  };

  const isConnected = weightStatus?.connected || false;
  const currentWeight = weightStatus?.currentWeight || "0.00";
  const currentUnit = weightStatus?.currentUnit || "kg";



  // ✅ Correct return placement
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Scale className="h-8 w-8 text-monitoring-blue" />
        <div>
          <h1 className="text-3xl font-bold text-white">Weighbridge Settings</h1>
          <p className="text-gray-400">
            Configure your digital weight scale connection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card className="bg-monitoring-dark border-monitoring-gray">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Connection Status</span>
            </CardTitle>
            <CardDescription>
              Current weighbridge connection and readings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Status:</span>
              <Badge
                variant={
                  weightStatus?.port && weightStatus?.baudRate
                    ? "default"
                    : "secondary"
                }
              >
                {weightStatus?.port && weightStatus?.baudRate
                  ? "Connected"
                  : "Disconnected"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Port:</span>
              <span className="text-white font-mono">
                {weightStatus?.port ?? ""}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Baud Rate:</span>
              <span className="text-white font-mono">
                {weightStatus?.baudRate ?? ""}
              </span>
            </div>

            <div className="border-t border-monitoring-gray pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-monitoring-blue">
                  {currentWeight}
                </div>
                <div className="text-lg text-gray-300 uppercase">
                  {currentUnit}
                </div>
              </div>
            </div>

            <Button
              onClick={handleTare}
              disabled={!isConnected || tareMutation.isPending}
              className="w-full bg-monitoring-blue hover:bg-monitoring-blue/90"
            >
              {tareMutation.isPending ? "Applying Tare..." : "TARE (Zero Scale)"}
            </Button>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card className="bg-monitoring-dark border-monitoring-gray">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Communication Settings</span>
            </CardTitle>
            <CardDescription>
              Configure serial port communication parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* COM Port */}
                <FormField
                  control={form.control}
                  name="comPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">COM Port</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-monitoring-slate border-monitoring-gray text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Baud Rate */}
                <FormField
                  control={form.control}
                  name="baudRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Baud Rate</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-monitoring-slate border-monitoring-gray text-white">
                            <SelectValue placeholder="Select baud rate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="9600">9600</SelectItem>
                          <SelectItem value="19200">19200</SelectItem>
                          <SelectItem value="38400">38400</SelectItem>
                          <SelectItem value="57600">57600</SelectItem>
                          <SelectItem value="115200">115200</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Data Bits */}
                  <FormField
                    control={form.control}
                    name="dataBits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Data Bits</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-monitoring-slate border-monitoring-gray text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stop Bits */}
                  <FormField
                    control={form.control}
                    name="stopBits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Stop Bits</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-monitoring-slate border-monitoring-gray text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Parity */}
                <FormField
                  control={form.control}
                  name="parity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Parity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-monitoring-slate border-monitoring-gray text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="odd">Odd</SelectItem>
                          <SelectItem value="even">Even</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={saveMutation.isPending || connectMutation.isPending}
                  className="w-full bg-monitoring-blue hover:bg-monitoring-blue/90"
                >
                  {saveMutation.isPending || connectMutation.isPending
                    ? "Saving & Connecting..."
                    : "Save & Connect to Weighbridge"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
