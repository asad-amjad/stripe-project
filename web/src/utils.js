export const separateSubscriptions=(subscriptions)=> {
    const result = {
      active: {},
      trial: {},
    };
  
    subscriptions.data.forEach(subscription => {
      const subscriptionId = subscription.id;
      const status = subscription.status;
  
      if (status === 'active') {
        result.active[subscriptionId] = subscription;
      } else if (status === 'trialing') {
        result.trial[subscriptionId] = subscription;
      }
    });
  
    return result;
  }
  
export const isObjectEmpty = (objectName) => {
  return objectName && Object.keys(objectName)?.length === 0
}
  

export const convertTimestampToReadable = (timestamp)=> {
  // Multiply by 1000 to convert from seconds to milliseconds
  const date = new Date(timestamp * 1000);

  // Format the date as a string
  const formattedDate = date.toLocaleString();

  return formattedDate;
}