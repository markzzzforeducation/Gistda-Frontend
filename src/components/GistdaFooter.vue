<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <footer class="gistda-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3 class="footer-title">Gistda</h3>
                <p class="footer-text">
                    สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (องค์การมหาชน) 
                    <br/>
                    สำนักงานใหญ่ (ศูนย์ราชการเฉลิมพระเกียรติ 80 พรรษา 5 ธันวาคม 2550) เลขที่ 120 
                    <br/>
                    อาคารรวมหน่วยราชการ (อาคารรัฐประศาสนภักดี) ชั้น 6 และชั้น 7 
                    <br/>
                    ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210
                </p>
            </div>
            
            <div class="footer-section">
                <h3 class="footer-title">{{ t('footer.contact') }}</h3>
                <div class="contact-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span>Call Center: 0-2141-4444</span>
                </div>
                <div class="contact-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span>saraban@gistda.or.th</span>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>{{ t('footer.copyright') }}</p>
        </div>
    </footer>
</template>

<style scoped>
.gistda-footer {
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    width: 100%;
}

.footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 60px 40px 40px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 48px;
}

.footer-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.footer-title {
    font-size: 18px;
    font-weight: 700;
    color: #676666ff;
    margin: 0 0 8px 0;
    letter-spacing: 0.5px;
}

.footer-text {
    font-size: 14px;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    transition: color 0.3s;
}

.contact-item:hover {
    color: #f0f0f0ff;
}

.contact-item svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px 40px;
    text-align: center;
}

.footer-bottom p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
    .footer-content {
        padding: 40px 24px 24px;
        gap: 32px;
    }
    
    .footer-bottom {
        padding: 20px 24px;
    }
}
</style>
