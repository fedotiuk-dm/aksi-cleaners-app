// Допоміжна функція для перекладу кодів послуг
export function getServiceName(serviceCode) {
    const services = {
        cleaning: 'Хімчистка',
        washing: 'Прання',
        ironing: 'Прасування',
        leather: 'Обробка шкіри',
        dyeing: 'Фарбування',
    };
    return services[serviceCode] || serviceCode;
}