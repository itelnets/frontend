export const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
};