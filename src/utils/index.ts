


export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

export function trackActivity(activityType: string, data?: any) {
    // TODO: Implement activity tracking
    console.log('Activity tracked:', activityType, data);
}