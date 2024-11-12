const geoip = require('geoip-lite');

exports.logVisitors = async (db, ip)=>{
    try{
        const geoInfo = geoip.lookup(ip);
        const visitorData = {
            ip,
            Timestamp: new Date(),
            geoInfo
        }
        const result = await db.collection('visitorLogs').insertOne(visitorData);
        return result;
    } catch (error){
        throw new Error('Error during logging visitor', error.message)
    }
}

exports.getVisitorCountInLast24Hours = async (db) => {
    const yesterday = new Date(new Date().getTime() - 24 *  60 * 60 * 1000);
    return await db.collection('visitorLogs').countDocuments({ Timestamp: { $gte: yesterday } });
};

exports.getLiveVisitorCount = async (db) => {
    const fiveMinutesAgo = new Date(new Date().getTime() - 1 * 60 * 1000); // 5 minutes
    const count = await db.collection('visitorLogs').countDocuments({ Timestamp: { $gte: fiveMinutesAgo } });
    return count;
};
 
 exports.getVisitorCountInLastWeek = async (db) => {
    const lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    return await db.collection('visitorLogs').countDocuments({ Timestamp: { $gte: lastWeek } });
 };
 
 exports.getVisitorCountInLastMonth = async (db) => {
    const lastMonth = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    return await db.collection('visitorLogs').countDocuments({ Timestamp: { $gte: lastMonth } });
 };
