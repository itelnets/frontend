import api from './api';

export interface BannerItem {
    _id: string;
    imageKey: string;
    imageUrl: string;
    fileSize?: number;
    width?: number;
    height?: number;
    order?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getBanners = async (): Promise<BannerItem[]> => {
    const { data } = await api.get<BannerItem[]>('/banners');
    return data;
};

export const createBanner = async (
    imageUrl: string,
    fileSize: number,
    width: number,
    height: number
): Promise<BannerItem> => {
    const { data } = await api.post<{ message: string, banner: BannerItem }>('/banners', {
        imageKey: imageUrl,
        fileSize,
        width,
        height
    });
    return data.banner;
};

export const deleteBanner = async (id: string): Promise<void> => {
    await api.delete(`/banners/${id}`);
};

export const updateBanner = async (id: string, data: Partial<BannerItem | { isActive?: boolean, imageKey?: string }>): Promise<BannerItem> => {
    const { data: res } = await api.patch<{ message: string, banner: BannerItem }>(`/banners/${id}`, data);
    return res.banner;
};

export const reorderBanners = async (orderedIds: string[]): Promise<void> => {
    await api.post('/banners/reorder', { order: orderedIds });
};
