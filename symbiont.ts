// symbiont.ts
import fs from "fs";
import path from "path";
import axios from "axios";

export interface VoiceSettings {
  ttsModel: string;
  pitch: number;
  speed: number;
  emotion: string;
}

export interface SymbiontProfile {
  id: string;
  user_hash: string;
  name: string;
  voice_settings: VoiceSettings;
  traits: Record<string, number>;
  embeddings: { vector_id: string; source: string; timestamp: string };
}

export class Symbiont {
  private profile: SymbiontProfile;
  private apiUrl: string;

  constructor(profilePath: string, apiUrl: string) {
    const raw = fs.readFileSync(path.resolve(profilePath), "utf-8");
    this.profile = JSON.parse(raw) as SymbiontProfile;
    this.apiUrl = apiUrl;
  }

  async sendMessage(prompt: string): Promise<string> {
    const payload = {
      profile_id: this.profile.id,
      prompt,
      traits: this.profile.traits
    };
    const { data } = await axios.post(`${this.apiUrl}/chat`, payload);
    return data.reply as string;
  }

  async speak(text: string): Promise<Buffer> {
    const { ttsModel, pitch, speed, emotion } = this.profile.voice_settings;
    const response = await axios.post(`${this.apiUrl}/tts`, {
      model: ttsModel,
      text,
      pitch,
      speed,
      emotion
    }, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }
}
