import about from "@/content/pages/about.html";
import contact from "@/content/pages/contact.html";
import faq from "@/content/pages/faq.html";
import home from "@/content/pages/home.html";
import innovation from "@/content/pages/innovation.html";
import modelsV27 from "@/content/pages/models-v27.html";
import news from "@/content/pages/news.html";
import newsAiCabin from "@/content/pages/news-ai-cabin.html";
import newsBatteryTech from "@/content/pages/news-battery-tech.html";
import newsEgyptEvFuture from "@/content/pages/news-egypt-ev-future.html";
import newsElectricWiring from "@/content/pages/news-electric-wiring.html";
import newsV23Design from "@/content/pages/news-v23-design.html";
import newsV27BreaksRangeRecords from "@/content/pages/news-v27-breaks-range-records.html";
import newsWandererCampaign from "@/content/pages/news-wanderer-campaign.html";
import reserve from "@/content/pages/reserve.html";
import services from "@/content/pages/services.html";
import servicesMaintenance from "@/content/pages/services-maintenance.html";
import servicesPrograms from "@/content/pages/services-programs.html";
import servicesWarranty from "@/content/pages/services-warranty.html";

const PAGES: Record<string, string> = {
  about,
  contact,
  faq,
  home,
  innovation,
  "models-v27": modelsV27,
  news,
  "news-ai-cabin": newsAiCabin,
  "news-battery-tech": newsBatteryTech,
  "news-egypt-ev-future": newsEgyptEvFuture,
  "news-electric-wiring": newsElectricWiring,
  "news-v23-design": newsV23Design,
  "news-v27-breaks-range-records": newsV27BreaksRangeRecords,
  "news-wanderer-campaign": newsWandererCampaign,
  reserve,
  services,
  "services-maintenance": servicesMaintenance,
  "services-programs": servicesPrograms,
  "services-warranty": servicesWarranty,
};

export async function readPageHtml(id: string): Promise<string> {
  const html = PAGES[id];
  if (!html) {
    throw new Error(`Unknown page HTML: ${id}`);
  }
  return html;
}
