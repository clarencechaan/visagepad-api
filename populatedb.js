#! /usr/bin/env node

console.log(
  "This script populates some test games, genres, consoles, and accessories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/video_game_inventory?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
const bcrypt = require("bcryptjs");
var User = require("./models/user");
var Post = require("./models/post");
var Comment = require("./models/comment");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const nameBank =
  "Liam Noah Oliver Elijah James William Benjamin Lucas Henry Theodore Jack Levi Alexander Jackson Mateo Daniel Michael Mason Sebastian Ethan Logan Owen Samuel Jacob Asher Aiden John Joseph Wyatt David Leo Luke Julian Hudson Grayson Matthew Ezra Gabriel Carter Isaac Jayden Luca Anthony Dylan Lincoln Thomas Maverick Elias Josiah Charles Caleb Christopher Ezekiel Miles Jaxon Isaiah Andrew Joshua Nathan Nolan Adrian Cameron Santiago Eli Aaron Ryan Angel Cooper Waylon Easton Kai Christian Landon Colton Roman Axel Brooks Jonathan Robert Jameson".split(
    " "
  );

var users = [];
var posts = [];
var comments = [];

function userCreate(first_name, last_name, username, password, cb) {
  var user = new User({
    first_name,
    last_name,
    username,
  });

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    user.password = hashedPassword;
    user.save(function (err) {
      if (err) {
        return cb(err, null);
      }
      console.log("New User: " + user);
      users.push(user);
      cb(null, user);
    });
  });
}

function postCreate(author, title, body, published, publish_date, img_url, cb) {
  var post = new Post({
    author,
    title,
    body,
    published,
    publish_date,
    img_url,
  });

  post.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Post: " + post);
    posts.push(post);
    cb(null, post);
  });
}

function commentCreate(name, text, post, timestamp, cb) {
  var comment = new Comment({
    name,
    text,
    post,
    timestamp,
  });

  comment.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Comment: " + comment);
    comments.push(comment);
    cb(null, comment);
  });
}

function createUsers(cb) {
  async.parallel(
    [
      function (callback) {
        userCreate("Leonard", "Day", "theapartment", "pass", callback);
      },
      function (callback) {
        userCreate("Alex", "Morris", "chocolatebar", "pass", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createPosts(cb) {
  async.parallel(
    [
      function (callback) {
        postCreate(
          users[0],
          "Called promise likewise three",
          "Months vexed cultivated enjoyment formal stuff suspected depend letters many elderly alteration company. Weddings better pleased doors expect might avoid oppose then invitation decisively opinion blind supposing arranging. Began society females perceive period invited brother manner scale arrived avoid. Face after about. By morning behaviour enjoyment produce inhabiting friendship lively to law. Real quitting depend on shy winter decay related account. Sure extent beloved. Agreeable shall ladyship themselves made. Small travelling visit nothing defective ashamed longer recommend much propriety branched strictly mr cousin each estate. Wrote size occasional against speedily uncommonly. \n\nImproved walls beyond wife led dear saved surrounded last resources noisier assurance one hill unknown. Waiting carriage instrument event widen therefore pianoforte shot quick late any attended did diverted. Questions call like thrown against winter might astonished cordial. Out saved another. Yet improved dejection spot john answer from comfort horrible principle child. Seeing pronounce except park kept household law room peculiar in. Daughter society replying worthy mrs talking. Fanny mother dissimilar equal property meet far invited building mistress they colonel endeavor quick state. Lasting mind musical education as doubt yourself saved went no formed. Woody attention everything view call reached adieus weeks theirs needed distant unaffected attending viewing the plate. \n\nThoughts defer admitted linen in ten  explained discourse viewing norland own. Marked case advantage half account steepest part maids perceived since plate sweetness towards from new quiet. Disposing draw unable contrasted simplicity matter downs lasting which outlived stuff. Shy throwing compliment whose unsatiable sixteen eldest arrived lose charmed death abode room correct formed suffering. Prepare viewing kept vulgar pulled party sincerity arose. Endeavor peculiar against property believe demesne. Improved delay near natural spring park jennings denied denied see some except limits blessing laughter property. Admiration theirs taken civilly cause winding express admiration wished but sympathize thoughts edward. Bore farther abilities arranging on wonder denoting attending manner. Reasonably gate window advice husband observe unfeeling ecstatic offices loud overcame though body margaret. \n\nAgreement produced picture consider. Stairs started sight concern. Time leaf since chicken feelings. Consulted draw unwilling laughter. Attacks fully themselves if drawings advantages principle pulled. Highest still fine proposal stronger jennings occasion. Seemed suspicion worthy kept against position inhabit provision woody however stimulated day chamber law. To dependent request four regard life whom exquisite entire breakfast chamber. On rather prudent except. West difficult place. ",
          true,
          Date.now(),
          "https://i.imgur.com/QZ5lNQQ.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Delay boy friends own improve drawings",
          "Thoughts defer admitted linen in ten  explained discourse viewing norland own. Marked case advantage half account steepest part maids perceived since plate sweetness towards from new quiet. Disposing draw unable contrasted simplicity matter downs lasting which outlived stuff. Shy throwing compliment whose unsatiable sixteen eldest arrived lose charmed death abode room correct formed suffering. Prepare viewing kept vulgar pulled party sincerity arose. Endeavor peculiar against property believe demesne. Improved delay near natural spring park jennings denied denied see some except limits blessing laughter property. Admiration theirs taken civilly cause winding express admiration wished but sympathize thoughts edward. Bore farther abilities arranging on wonder denoting attending manner. Reasonably gate window advice husband observe unfeeling ecstatic offices loud overcame though body margaret. \n\nAgreement produced picture consider. Stairs started sight concern. Time leaf since chicken feelings. Consulted draw unwilling laughter. Attacks fully themselves if drawings advantages principle pulled. Highest still fine proposal stronger jennings occasion. Seemed suspicion worthy kept against position inhabit provision woody however stimulated day chamber law. To dependent request four regard life whom exquisite entire breakfast chamber. On rather prudent except. West difficult place. \n\nQuick everything power prospect ability mistake. Taste but lady face shewing smallness expenses seemed share rejoiced edward examine chief almost. Something home left dwelling recurred daughters ferrars guest dependent direct plenty recommend numerous then improved indulgence. Drew wrong delivered missed chamber shewing size subject together conveying justice son savings formal hard poor. Cousin tended sir dear humoured will before surprise early disposing defective see county state. Death private read suspected speedily felt being remaining. Fully principles evening excellence while quiet. Wondered between summer taken now daughters walk boisterous. Journey taken evil. Described provision carried continual advantages bringing account resolving forth give secure appetite waiting before result. \n\nOn scale intention intention than out applauded name innate advice confined resolution unaffected. So saw of inquiry either game walk entire basket happen post equal heard seeing sure. Assured near conveying around attended than change elegance wrong horses continue stuff properly done sooner front throwing. Commanded hastened produced blush meet week hearted limits replying devonshire set hour removal. Woman on order honoured too thing placing barton nature death walls hastened greater kept promise. Compliment determine trees manner admitted formed. Hills perpetual seen offer branch desirous not believing fully unable. Settling just resolving sigh sir gone winding our mother. Laughing quitting hastily relation small relation. Hundred warmly come elegance would course afraid brother early fanny chicken adieus rather replied. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24,
          "https://i.imgur.com/F1FiqmL.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "Delicate open told expression improve",
          "Quick everything power prospect ability mistake. Taste but lady face shewing smallness expenses seemed share rejoiced edward examine chief almost. Something home left dwelling recurred daughters ferrars guest dependent direct plenty recommend numerous then improved indulgence. Drew wrong delivered missed chamber shewing size subject together conveying justice son savings formal hard poor. Cousin tended sir dear humoured will before surprise early disposing defective see county state. Death private read suspected speedily felt being remaining. Fully principles evening excellence while quiet. Wondered between summer taken now daughters walk boisterous. Journey taken evil. Described provision carried continual advantages bringing account resolving forth give secure appetite waiting before result. \n\nOn scale intention intention than out applauded name innate advice confined resolution unaffected. So saw of inquiry either game walk entire basket happen post equal heard seeing sure. Assured near conveying around attended than change elegance wrong horses continue stuff properly done sooner front throwing. Commanded hastened produced blush meet week hearted limits replying devonshire set hour removal. Woman on order honoured too thing placing barton nature death walls hastened greater kept promise. Compliment determine trees manner admitted formed. Hills perpetual seen offer branch desirous not believing fully unable. Settling just resolving sigh sir gone winding our mother. Laughing quitting hastily relation small relation. Hundred warmly come elegance would course afraid brother early fanny chicken adieus rather replied. \n\nStaying am discovery allowance men simple then believed guest drew busy since longer she wondered really. Rather ye one wanted considered equally examine. Terms preserved delightful. Effect insensible  hung hoped gravity sake property allow remark charmed fine downs. Wise whom son felt provision lived opinions dashwood shall feeling these passage mr. Dissuade widen graceful. Determine those forty admitted advantage chief bed solid could dinner improve compliment breeding. Body arise hastened likely common busy heard coming when. Examine arrived their reasonable play we. Seems matters extent together entreaties sociable bore doubt shot intention passed words many blushes near man wondered. \n\nPraise exquisite promise minutes connection wanted smile behaviour. Such village delay prudent any produce existence projection. Ask west pretty except therefore. Reserved procuring how concern considered garden off  required uneasy though discovery smallest forfeited engaged though. Easy hastily missed bed morning stanhill minuter need prosperous examine amiable justice two occasional add. Carriage spoil water existence resolution too direct compass handsome continue village entirely. Improved me reached outlived apartments lived suffering unpleasant. Hold  old steepest. Would gentleman propriety sensible. Continuing missed sometimes on cordially several ability her remember. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 2,
          "https://i.imgur.com/ND85zWv.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Discourse tore prevent front",
          "Staying am discovery allowance men simple then believed guest drew busy since longer she wondered really. Rather ye one wanted considered equally examine. Terms preserved delightful. Effect insensible  hung hoped gravity sake property allow remark charmed fine downs. Wise whom son felt provision lived opinions dashwood shall feeling these passage mr. Dissuade widen graceful. Determine those forty admitted advantage chief bed solid could dinner improve compliment breeding. Body arise hastened likely common busy heard coming when. Examine arrived their reasonable play we. Seems matters extent together entreaties sociable bore doubt shot intention passed words many blushes near man wondered. \n\nPraise exquisite promise minutes connection wanted smile behaviour. Such village delay prudent any produce existence projection. Ask west pretty except therefore. Reserved procuring how concern considered garden off  required uneasy though discovery smallest forfeited engaged though. Easy hastily missed bed morning stanhill minuter need prosperous examine amiable justice two occasional add. Carriage spoil water existence resolution too direct compass handsome continue village entirely. Improved me reached outlived apartments lived suffering unpleasant. Hold  old steepest. Would gentleman propriety sensible. Continuing missed sometimes on cordially several ability her remember. \n\nDiscourse boy wishing offices lasted ample dependent prosperous me amiable greater weeks another elderly unpacked cultivated. Breakfast explain moments side opinions admiration. Something confined believing arrived state material scale whose strongly. Unpleasant figure taste kept procuring when leaf welcome graceful sell outward feel believing delivered. Said ability drawings seemed suffering. Ferrars behind looking smart. Present bed merit explained others prevent properly marry gay calling partiality possible sufficient am desirous daughters simplicity. Found honoured court no among furnished instantly prudent produce oppose. Elderly resolved charmed stairs newspaper green suspicion bore state late bore pleasure acuteness rooms excellent. Confined position of everything around alone september favour decisively distant feet its. \n\nConcerns genius smile replied him temper which many therefore room laughing. Weather arose absolute sociable sir. Think pretty objection need perceive belonging gone upon present given. Half smart outlived resolution late most unpleasant. There natural own said unpleasant advantages they. Mean secure own whether landlord put become express like enjoyment regret felt roof letters early extremity think. Conduct speaking daughter offered material tall your myself. Friendly kept subject expense motionless improve enjoy. Length began expenses plan spirit private hour sense compliment. Income unaffected made terms oh brought views was snug themselves narrow spot over door still thing worse. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 4,
          "https://i.imgur.com/79QX4xq.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "Maids enough properly equal farther",
          "Discourse boy wishing offices lasted ample dependent prosperous me amiable greater weeks another elderly unpacked cultivated. Breakfast explain moments side opinions admiration. Something confined believing arrived state material scale whose strongly. Unpleasant figure taste kept procuring when leaf welcome graceful sell outward feel believing delivered. Said ability drawings seemed suffering. Ferrars behind looking smart. Present bed merit explained others prevent properly marry gay calling partiality possible sufficient am desirous daughters simplicity. Found honoured court no among furnished instantly prudent produce oppose. Elderly resolved charmed stairs newspaper green suspicion bore state late bore pleasure acuteness rooms excellent. Confined position of everything around alone september favour decisively distant feet its. \n\nConcerns genius smile replied him temper which many therefore room laughing. Weather arose absolute sociable sir. Think pretty objection need perceive belonging gone upon present given. Half smart outlived resolution late most unpleasant. There natural own said unpleasant advantages they. Mean secure own whether landlord put become express like enjoyment regret felt roof letters early extremity think. Conduct speaking daughter offered material tall your myself. Friendly kept subject expense motionless improve enjoy. Length began expenses plan spirit private hour sense compliment. Income unaffected made terms oh brought views was snug themselves narrow spot over door still thing worse. \n\nFifteen any wish esteems equally before wound nearer. Minuter ladies both replied drawn limits placing case. Feel since saved. Enable pleasure neat moderate certainty perfectly misery father suitable its uncommonly face having strongly walls preference. Discourse something middleton missed interested. Resolving face ham far music cousin they. Arrived cheerful well new shot both pleasant wisdom five smile spring. Listening address abroad scarcely joy endeavor screened esteems esteem dissuade chicken otherwise unpleasant satisfied this. Produce perfectly dine square green held yet ought effect manor ladyship than we. Prevailed household assure manners middleton other on so aware principle none linen wondered five. \n\nMade present held dine. Is scarcely him shameless three above something blush demands been. Gravity pleasure get prosperous correct effects moderate hung regard disposing. Opinion discourse females roused ladyship for suffering ferrars. Private square make therefore. Man agreement songs allow rich course seven the meant song coming down an visited. Enjoyed dashwood our marry september rendered sold sing hand done unknown. Seems common suffer surrounded. Miss hand between gave defective alteration door hastened dear in times pasture miss conviction. Affection real good difficult relation hoped for manner body charmed mind death. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 5,
          "https://i.imgur.com/phROXAU.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Ferrars child money looked",
          "Fifteen any wish esteems equally before wound nearer. Minuter ladies both replied drawn limits placing case. Feel since saved. Enable pleasure neat moderate certainty perfectly misery father suitable its uncommonly face having strongly walls preference. Discourse something middleton missed interested. Resolving face ham far music cousin they. Arrived cheerful well new shot both pleasant wisdom five smile spring. Listening address abroad scarcely joy endeavor screened esteems esteem dissuade chicken otherwise unpleasant satisfied this. Produce perfectly dine square green held yet ought effect manor ladyship than we. Prevailed household assure manners middleton other on so aware principle none linen wondered five. \n\nMade present held dine. Is scarcely him shameless three above something blush demands been. Gravity pleasure get prosperous correct effects moderate hung regard disposing. Opinion discourse females roused ladyship for suffering ferrars. Private square make therefore. Man agreement songs allow rich course seven the meant song coming down an visited. Enjoyed dashwood our marry september rendered sold sing hand done unknown. Seems common suffer surrounded. Miss hand between gave defective alteration door hastened dear in times pasture miss conviction. Affection real good difficult relation hoped for manner body charmed mind death. \n\nItself purse advantages delightful eagerness speaking pasture without adieus cordially green walk indulged assistance listening chicken. Sixteen reasonable kept head produced songs opinions demands thirty which uneasy need. Express questions delight sportsmen screened delivered. Peculiar met every first misery estimating hoped required. Bringing address by through delightful luckily chief paid. Northward chamber private fanny. Hundred above required sense and. Past played attacks because order. Northward considered parlors event. Sorry discourse miles money roof small use ignorant. \n\nNewspaper burst parties arise full paid whether genius. New if made charmed first breeding rather hills confined mother pleased. Hold household possession occasional. Ability seems equally since are performed ladies examine carried. Comparison replying income oppose attacks woody looked power enjoyment sincerity girl having wise began wonder ready belonging. Sake spring boisterous curiosity forfeited these welcome outweigh. Paid may cease shew colonel gay decisively tall order arranging dejection. Sooner season instrument shyness terminated window abode lasted sociable rapid when snug horrible. Too barton over vulgar sportsman frequently their except hills acceptance innate certainly. Hill myself themselves defective evil excellent shed within parish unsatiable me. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 7,
          "https://i.imgur.com/5m7G1lF.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "Thrown proceed rapid knew",
          "Itself purse advantages delightful eagerness speaking pasture without adieus cordially green walk indulged assistance listening chicken. Sixteen reasonable kept head produced songs opinions demands thirty which uneasy need. Express questions delight sportsmen screened delivered. Peculiar met every first misery estimating hoped required. Bringing address by through delightful luckily chief paid. Northward chamber private fanny. Hundred above required sense and. Past played attacks because order. Northward considered parlors event. Sorry discourse miles money roof small use ignorant. \n\nNewspaper burst parties arise full paid whether genius. New if made charmed first breeding rather hills confined mother pleased. Hold household possession occasional. Ability seems equally since are performed ladies examine carried. Comparison replying income oppose attacks woody looked power enjoyment sincerity girl having wise began wonder ready belonging. Sake spring boisterous curiosity forfeited these welcome outweigh. Paid may cease shew colonel gay decisively tall order arranging dejection. Sooner season instrument shyness terminated window abode lasted sociable rapid when snug horrible. Too barton over vulgar sportsman frequently their except hills acceptance innate certainly. Hill myself themselves defective evil excellent shed within parish unsatiable me. \n\nEspecially seemed increasing winding gave wise chapter speedily. Alteration his which learn thoroughly pain set remain jennings supposing throwing heart door regret attempted lasting. Exquisite preferred grave besides power civilly placing decisively. Pretty parish excellent devonshire recommend two meet. Having tiled arrival daughter sang settling winter. Related object private basket chapter passage expression poor certainly direction learning years likely wicket. Drew joy devonshire dejection exposed get. Thing pursuit gay sent correct screened words smallest domestic dull walls newspaper. Turned sister matters four dine concern. Impossible wished knew our brought walls there drawn simple natural enjoyment. \n\nDelivered denote praise explained opinions compliment myself detract commanded forfeited covered vicinity resolution put remainder therefore frankness. Simple can do guest post does offices. Steepest grave felt dull prepared far pure carriage travelling behaviour up. Head agreed cause mother horrible shot noisy rejoiced blushes. Wise attempt after how cease tended quitting themselves extent life child. Marianne ten great lady adieus. Effect replied dependent blessing numerous lasting sportsmen if considered denoting though lose provision depart resembled total both. Improve give consider winding dependent belonging provided easily sentiments cultivated stronger assure marianne made. Chief would rest interested. Remark overcame offices court tended smile. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 7,
          "https://i.imgur.com/PVaO8b4.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Resolving wife immediate full removed attempt",
          "Especially seemed increasing winding gave wise chapter speedily. Alteration his which learn thoroughly pain set remain jennings supposing throwing heart door regret attempted lasting. Exquisite preferred grave besides power civilly placing decisively. Pretty parish excellent devonshire recommend two meet. Having tiled arrival daughter sang settling winter. Related object private basket chapter passage expression poor certainly direction learning years likely wicket. Drew joy devonshire dejection exposed get. Thing pursuit gay sent correct screened words smallest domestic dull walls newspaper. Turned sister matters four dine concern. Impossible wished knew our brought walls there drawn simple natural enjoyment. \n\nDelivered denote praise explained opinions compliment myself detract commanded forfeited covered vicinity resolution put remainder therefore frankness. Simple can do guest post does offices. Steepest grave felt dull prepared far pure carriage travelling behaviour up. Head agreed cause mother horrible shot noisy rejoiced blushes. Wise attempt after how cease tended quitting themselves extent life child. Marianne ten great lady adieus. Effect replied dependent blessing numerous lasting sportsmen if considered denoting though lose provision depart resembled total both. Improve give consider winding dependent belonging provided easily sentiments cultivated stronger assure marianne made. Chief would rest interested. Remark overcame offices court tended smile. \n\nCalling estate advanced horrible waited above again therefore winter recommend because considered. Wisdom water want nay their spirit extremely park difficult smile jokes that leave against. Coming appear brother supplied. Doubt pleased discourse up for material remain ecstatic income terminated talking than settle looking learning son suffer. Pleasure lovers folly dried difficult dear occasion very procuring told style first yourself power forty friendship unreserved. Our worthy waited. Nature coming could piqued travelling esteems mutual graceful unable three son. Windows believe world attacks cause ought direction excited about moderate debating advantage side. Inhabit design dull sentiments windows ourselves compass ignorant wife doors father but. Regret he moonlight fulfilled. \n\nPerceive then how conveying removal stimulated consulted. Musical advanced four add some. Denote dispatched square desirous indeed welcomed securing last discretion formed pronounce blush cousin brother uncommonly asked. Was melancholy edward supposing put partiality side held seen still present colonel jointure terminated large. Dried age sensible margaret offending greatly. Extensive views september afford hundred consisted feebly looked attempted acuteness sight friendship praise account busy wisdom. Real voice while although when old extensive civilly paid lasting. Wound reasonably especially total defer cease ever spoil projecting name purse. Roused called whom impossible who amiable who ladyship. Needed correct so solid piqued lasted likely ought dining whole. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 14,
          "https://i.imgur.com/cF3OzA1.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "About understood enough few abroad",
          "Calling estate advanced horrible waited above again therefore winter recommend because considered. Wisdom water want nay their spirit extremely park difficult smile jokes that leave against. Coming appear brother supplied. Doubt pleased discourse up for material remain ecstatic income terminated talking than settle looking learning son suffer. Pleasure lovers folly dried difficult dear occasion very procuring told style first yourself power forty friendship unreserved. Our worthy waited. Nature coming could piqued travelling esteems mutual graceful unable three son. Windows believe world attacks cause ought direction excited about moderate debating advantage side. Inhabit design dull sentiments windows ourselves compass ignorant wife doors father but. Regret he moonlight fulfilled. \n\nPerceive then how conveying removal stimulated consulted. Musical advanced four add some. Denote dispatched square desirous indeed welcomed securing last discretion formed pronounce blush cousin brother uncommonly asked. Was melancholy edward supposing put partiality side held seen still present colonel jointure terminated large. Dried age sensible margaret offending greatly. Extensive views september afford hundred consisted feebly looked attempted acuteness sight friendship praise account busy wisdom. Real voice while although when old extensive civilly paid lasting. Wound reasonably especially total defer cease ever spoil projecting name purse. Roused called whom impossible who amiable who ladyship. Needed correct so solid piqued lasted likely ought dining whole. \n\nArise favourite length settling staying delay stairs viewing calling mistress indulged twenty collecting again produce. Offence position supported roused power effect can lived ashamed. Sex worth replied use. Merely esteem greatly juvenile subjects roof aware betrayed behaviour expression acceptance forfeited. Each behaved proposal. Favour mother alteration lain. Certain surprise marriage same property wanted form perhaps uncommonly if mistake inhabiting leave objection inquietude. Sympathize resolved trifling state. Occasional soon again forty door wondered heard mutual frequently handsome apartments. Resolved am observe marriage shameless repulsive prepare plate delivered ashamed required passage. \n\nDistrusts amiable mile words interest conviction believing barton shy resolve waited something pain shutters lovers. Books appear none meet improving gate water from unfeeling outlived gave rest. County played gave or received since contempt acceptance mrs become  dispatched game it material. Far travelling time sold home. Me again missed thrown hour expense cause daughters resolution busy time. Charm sense taste prosperous. Stanhill entrance delicate otherwise acuteness too may supported likewise resolving prevent painful terms village especially wishing shot. Finished started the need projecting met answered name diverted. Husbands likewise esteems sincerity studied address time. Chapter little stairs she quit proposal. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 18,
          "https://i.imgur.com/K1TLEEa.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Ample addition suspected latter",
          "Arise favourite length settling staying delay stairs viewing calling mistress indulged twenty collecting again produce. Offence position supported roused power effect can lived ashamed. Sex worth replied use. Merely esteem greatly juvenile subjects roof aware betrayed behaviour expression acceptance forfeited. Each behaved proposal. Favour mother alteration lain. Certain surprise marriage same property wanted form perhaps uncommonly if mistake inhabiting leave objection inquietude. Sympathize resolved trifling state. Occasional soon again forty door wondered heard mutual frequently handsome apartments. Resolved am observe marriage shameless repulsive prepare plate delivered ashamed required passage. \n\nDistrusts amiable mile words interest conviction believing barton shy resolve waited something pain shutters lovers. Books appear none meet improving gate water from unfeeling outlived gave rest. County played gave or received since contempt acceptance mrs become  dispatched game it material. Far travelling time sold home. Me again missed thrown hour expense cause daughters resolution busy time. Charm sense taste prosperous. Stanhill entrance delicate otherwise acuteness too may supported likewise resolving prevent painful terms village especially wishing shot. Finished started the need projecting met answered name diverted. Husbands likewise esteems sincerity studied address time. Chapter little stairs she quit proposal. \n\nHills scale remarkably unsatiable unfeeling moderate. Correct behaviour charmed sense effect woman loud future exertion outweigh strongly propriety explained likewise resolved met. Concern another exertion china there thoroughly part you open lived projection dearest necessary exercise allowance lived beauty. Answer departure year denote itself thoroughly sure true merry young set small engage. Considered forming equal. Themselves equally lovers merit direction window performed unwilling many off misery life. Visitor lasting admire all limited married highly september. More john chiefly herself. Letter most answered anxious. Mile esteem learn read cultivated. \n\nBreeding more took except result before widen frequently body assure excellent deficient matters connection terms strangers. Unable hills peculiar relation dull cordial manners manor unfeeling repair wooded ye law esteem make. Power afford blessing power ham staying consulted admire. Denote mistaken highest. Meant hills sure delicate afford could. Material then sudden purse excellence no determine about horses particular. Ought affection seen men branch words followed weather left direct talking middleton described size aware. Towards hold recurred. Observe existence society. Gone gravity calling smallest remainder. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 24,
          "https://i.imgur.com/wTvuaTt.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "Four leave improved twenty",
          "Hills scale remarkably unsatiable unfeeling moderate. Correct behaviour charmed sense effect woman loud future exertion outweigh strongly propriety explained likewise resolved met. Concern another exertion china there thoroughly part you open lived projection dearest necessary exercise allowance lived beauty. Answer departure year denote itself thoroughly sure true merry young set small engage. Considered forming equal. Themselves equally lovers merit direction window performed unwilling many off misery life. Visitor lasting admire all limited married highly september. More john chiefly herself. Letter most answered anxious. Mile esteem learn read cultivated. \n\nBreeding more took except result before widen frequently body assure excellent deficient matters connection terms strangers. Unable hills peculiar relation dull cordial manners manor unfeeling repair wooded ye law esteem make. Power afford blessing power ham staying consulted admire. Denote mistaken highest. Meant hills sure delicate afford could. Material then sudden purse excellence no determine about horses particular. Ought affection seen men branch words followed weather left direct talking middleton described size aware. Towards hold recurred. Observe existence society. Gone gravity calling smallest remainder. \n\nCommanded margaret him lively. Event than society especially terms understood songs offence solid. Said say yet occasional quitting design stimulated her longer lain. Herself forty up things extremely respect debating left nay. Followed screened considered subjects meant read bred denote become remainder face. Enabled cease attempted projection inhabit rapid welcomed likewise greatly removed length spirit afraid preferred may chamber mile. Expression sigh could unwilling years admitted fifteen described being remember sitting insipidity. Gate every if staying saw polite quick way throwing consisted answer delicate collecting apartments raising. Compass body distance. Does inquiry nor who lived exeter common manners smallness adieus mention worthy. \n\nEducation since present society walk weather past. Betrayed head period arise trifling. Music speedily but wooded cannot mean old cannot. Joy difficult announcing hold behind village unaffected dare most cousins tore. Remaining those husband state understood objection game questions nothing pleasant may needed four discourse defective why. Add pleasure formerly having projecting instantly basket. Present maids held exeter boisterous led. Collected difficult adapted window norland west difficult spot. Promise fat mother possession good cultivated amongst. Heart bred hopes related genius nothing garrets party busy which very dispatched effect. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 26,
          "https://i.imgur.com/9y1bNF0.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Each scale twenty astonished",
          "Commanded margaret him lively. Event than society especially terms understood songs offence solid. Said say yet occasional quitting design stimulated her longer lain. Herself forty up things extremely respect debating left nay. Followed screened considered subjects meant read bred denote become remainder face. Enabled cease attempted projection inhabit rapid welcomed likewise greatly removed length spirit afraid preferred may chamber mile. Expression sigh could unwilling years admitted fifteen described being remember sitting insipidity. Gate every if staying saw polite quick way throwing consisted answer delicate collecting apartments raising. Compass body distance. Does inquiry nor who lived exeter common manners smallness adieus mention worthy. \n\nEducation since present society walk weather past. Betrayed head period arise trifling. Music speedily but wooded cannot mean old cannot. Joy difficult announcing hold behind village unaffected dare most cousins tore. Remaining those husband state understood objection game questions nothing pleasant may needed four discourse defective why. Add pleasure formerly having projecting instantly basket. Present maids held exeter boisterous led. Collected difficult adapted window norland west difficult spot. Promise fat mother possession good cultivated amongst. Heart bred hopes related genius nothing garrets party busy which very dispatched effect. \n\nPicture had spot rather woman noisier asked dissuade trees passage sons life compact money guest direct. So too ladies attachment wholly in. My say supplied education ask exercise terms. May favour supported every humanity say whether. Denied demesne dissimilar summer while meet. Sufficient equal furniture indulgence possession affronting rather event chief scarcely blessing. Agreeable wishing farther favourite part put lain of me precaution contained these. Than formed sang placing promotion head pulled scarcely. Favour raising preference. Mother edward believe uncommonly polite man regular northward rapturous tell september indulged music. \n\nInhabit possible state bringing place morning settled cease sensible uncommonly mile anxious building throwing perpetual securing. Distance paid something desire branched depend words only noisier handsome. Thought mention shortly carriage when far vanity. Dissimilar except eyes friendship music cousin drew everything and commanded seven them smart exquisite woody. Cordially extremity remember property. Regret wisdom views rest therefore feet. Apartments true post tore friendship lived season moments deficient played see your marked. Service wife elinor done eldest answered world feeling compass mr fifteen abroad unlocked it lasting my built. Gate oh equally travelling but. Debating ham dejection limits suffering favourite allowance distance recurred. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 29,
          "https://i.imgur.com/flzNuxe.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "However blushes rapid sorry procured too",
          "Picture had spot rather woman noisier asked dissuade trees passage sons life compact money guest direct. So too ladies attachment wholly in. My say supplied education ask exercise terms. May favour supported every humanity say whether. Denied demesne dissimilar summer while meet. Sufficient equal furniture indulgence possession affronting rather event chief scarcely blessing. Agreeable wishing farther favourite part put lain of me precaution contained these. Than formed sang placing promotion head pulled scarcely. Favour raising preference. Mother edward believe uncommonly polite man regular northward rapturous tell september indulged music. \n\nInhabit possible state bringing place morning settled cease sensible uncommonly mile anxious building throwing perpetual securing. Distance paid something desire branched depend words only noisier handsome. Thought mention shortly carriage when far vanity. Dissimilar except eyes friendship music cousin drew everything and commanded seven them smart exquisite woody. Cordially extremity remember property. Regret wisdom views rest therefore feet. Apartments true post tore friendship lived season moments deficient played see your marked. Service wife elinor done eldest answered world feeling compass mr fifteen abroad unlocked it lasting my built. Gate oh equally travelling but. Debating ham dejection limits suffering favourite allowance distance recurred. \n\nPlayed unable civil none being now. Pretended colonel little delay new. Away hope fat knew regard detract ask intention replied wishes admiration. Poor hills sometimes poor lasted. Man moreover herself adapted law roof me brother parlors picture yourself hold out within. Although difficult repeated. Fact taste if this suffer set delightful astonished delight often branched pronounce body attending find. Very forfeited loud exercise or something table sons three excellence existence. Frankness rose matters means compact exercise is months depending polite entrance reached perceive delay appearance rejoiced. Brought things into what hardly examine court ten into total just need linen open. \n\nTwo am related betrayed conduct mention offered wandered highly leave insensible result. Explain melancholy perceive often another bed windows agreeable behaved was tall park yet domestic man make goodness. Game laughter party thirty exposed sake uncommonly money its mrs pressed miss merry truth simplicity thing disposal. Spoil hastily confined why denied kindness hardly china moderate frequently something soon uneasy chicken. Conviction forty doubt painful hoped share sons humoured think year affixed elinor direct. Turned enjoy having provision chamber. Excited denied simplicity balls terminated forfeited be cordially against. Greater belonging both wish females while trees admitting advice edward. Heard if young gate fat possible steepest perfectly waiting relied. Likewise kindness purse collecting extended place remark debating supported sons husbands. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 35,
          "https://i.imgur.com/26RYvWt.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Incommode them become leave confined",
          "Played unable civil none being now. Pretended colonel little delay new. Away hope fat knew regard detract ask intention replied wishes admiration. Poor hills sometimes poor lasted. Man moreover herself adapted law roof me brother parlors picture yourself hold out within. Although difficult repeated. Fact taste if this suffer set delightful astonished delight often branched pronounce body attending find. Very forfeited loud exercise or something table sons three excellence existence. Frankness rose matters means compact exercise is months depending polite entrance reached perceive delay appearance rejoiced. Brought things into what hardly examine court ten into total just need linen open. \n\nTwo am related betrayed conduct mention offered wandered highly leave insensible result. Explain melancholy perceive often another bed windows agreeable behaved was tall park yet domestic man make goodness. Game laughter party thirty exposed sake uncommonly money its mrs pressed miss merry truth simplicity thing disposal. Spoil hastily confined why denied kindness hardly china moderate frequently something soon uneasy chicken. Conviction forty doubt painful hoped share sons humoured think year affixed elinor direct. Turned enjoy having provision chamber. Excited denied simplicity balls terminated forfeited be cordially against. Greater belonging both wish females while trees admitting advice edward. Heard if young gate fat possible steepest perfectly waiting relied. Likewise kindness purse collecting extended place remark debating supported sons husbands. \n\nConsulted would added life she bringing sudden green. Season cease secure. Over perpetual wife ladies depend length you judgment. Trees offer demesne theirs tiled happiness outweigh rose himself cordially unaffected husbands removal bred party. Wholly say precaution resolve followed visitor warmly form solid shy doubt garden waited. Same sister husband thing become. Terms books evil fact. Considered removal expression satisfied want handsome principles limits moonlight distrusts period commanded. Northward how by drew resembled two excuse wife moments scale. Rapid noisier three against attempt park. \n\nAbility wife read difficult manner immediate extensive having shutters total fortune others this. Observe meant leaf uneasy offence covered roof servants tastes surrounded herself truth points reasonably. Ask dissuade defer fortune pulled elegance compliment admitted. Lose extremely prudent staying additions expenses was paid linen viewing surprise opinions. Six case propriety an forth unable. Themselves certain minutes little talked appear  began months sixteen tended. Late whole as sang excellent timed message wishes said money wrote tears attachment. Up door walk consider attacks resolution. Hoped dissuade merry trifling game ready speedily allowance behaviour sensible written cordially position entered sociable. Fancy took screened visited lain why. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 49,
          "https://i.imgur.com/MgUYcbz.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "Left exeter hand game attention something pulled",
          "Consulted would added life she bringing sudden green. Season cease secure. Over perpetual wife ladies depend length you judgment. Trees offer demesne theirs tiled happiness outweigh rose himself cordially unaffected husbands removal bred party. Wholly say precaution resolve followed visitor warmly form solid shy doubt garden waited. Same sister husband thing become. Terms books evil fact. Considered removal expression satisfied want handsome principles limits moonlight distrusts period commanded. Northward how by drew resembled two excuse wife moments scale. Rapid noisier three against attempt park. \n\nAbility wife read difficult manner immediate extensive having shutters total fortune others this. Observe meant leaf uneasy offence covered roof servants tastes surrounded herself truth points reasonably. Ask dissuade defer fortune pulled elegance compliment admitted. Lose extremely prudent staying additions expenses was paid linen viewing surprise opinions. Six case propriety an forth unable. Themselves certain minutes little talked appear  began months sixteen tended. Late whole as sang excellent timed message wishes said money wrote tears attachment. Up door walk consider attacks resolution. Hoped dissuade merry trifling game ready speedily allowance behaviour sensible written cordially position entered sociable. Fancy took screened visited lain why. \n\nQuit parlors impossible fact bachelor servants. Betrayed words expression. Pretty beauty hill warmly steepest oppose denied exposed pulled not woody explained songs present merry. Last tried and affronting admire ashamed nor possession horrible marry among again afford our. Situation dashwoods grave proceed repeated off thing learn jennings beloved except opinions. Required object assure sudden looked mention at poor provided zealously they cultivated felt post deficient. From cheered ought downs frankness rich sake. These denied civilly disposal table sent have. Think intention tall wholly china then. Witty highest unlocked length. \n\nAdmitting furnished estimating fully songs vicinity within. Drawn precaution ever late regard acceptance improved dejection denied wholly. Something comfort acceptance books distant explain myself books supposing reached scarcely leaf pianoforte since shall raillery lovers. Attending county cause. Sense belonging stanhill put margaret good advantages paid added attention necessary garrets. Consider assure far promotion since charmed domestic going additions timed amiable ability were leaf highest highly. Thoroughly paid ferrars welcomed may limits domestic mutual garrets returned pressed offending sentiments all mother unaffected. Solid effects worth stimulated mirth household diminution. Gone excited sigh tended offered fully. Sight having give held dried instantly. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 52,
          "https://i.imgur.com/X2z2QEZ.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[1],
          "Since old must carried old",
          "Quit parlors impossible fact bachelor servants. Betrayed words expression. Pretty beauty hill warmly steepest oppose denied exposed pulled not woody explained songs present merry. Last tried and affronting admire ashamed nor possession horrible marry among again afford our. Situation dashwoods grave proceed repeated off thing learn jennings beloved except opinions. Required object assure sudden looked mention at poor provided zealously they cultivated felt post deficient. From cheered ought downs frankness rich sake. These denied civilly disposal table sent have. Think intention tall wholly china then. Witty highest unlocked length. \n\nAdmitting furnished estimating fully songs vicinity within. Drawn precaution ever late regard acceptance improved dejection denied wholly. Something comfort acceptance books distant explain myself books supposing reached scarcely leaf pianoforte since shall raillery lovers. Attending county cause. Sense belonging stanhill put margaret good advantages paid added attention necessary garrets. Consider assure far promotion since charmed domestic going additions timed amiable ability were leaf highest highly. Thoroughly paid ferrars welcomed may limits domestic mutual garrets returned pressed offending sentiments all mother unaffected. Solid effects worth stimulated mirth household diminution. Gone excited sigh tended offered fully. Sight having give held dried instantly. \n\nFeebly departure over consulted thrown. Passage match its mr if narrow assistance day consulted collecting who sportsman miss against. May agreement welcomed prevent expect waiting although demesne were. Agreement elinor man her concerns advice shyness enjoyed. Consulted dependent fifteen know how address proposal are mirth full. Frankness times dear dinner scale call heard stairs old wrong extent listening. Cordially my sending invitation greater abilities parties returned again dwelling ignorant exertion made side strangers possession. Marriage mother misery dwelling total drawn noise these impossible genius west replied future account. Part woman its plan whether civility state provision commanded hunted matters his barton into hill you cultivated. Prevent fancy men education cold resources questions china side need match knew can full depend to. \n\nSometimes reserved inhabiting removal. She frequently strongly thoroughly decisively compass comfort found fully peculiar delighted more september tiled endeavor resources. Laughter wooded village become esteems exeter long raptures melancholy. Hunted agreeable smile sight time keeps explained literature contained feelings attempted took impossible without plate dear exeter. Figure exposed ladies private settle studied companions size child wisdom discretion need jennings fine dine. Remark trees one tedious themselves afraid windows summer. Civil words right length demesne besides expenses added repulsive acuteness off him. Thoroughly square each companions itself morning met busy horrible perceived family. Unlocked females feelings well certainty beauty given dwelling held improve design seemed mother certainly sending removal. Subject room dearest it themselves. ",
          true,
          Date.now() - 1000 * 60 * 60 * 24 * 55,
          "https://i.imgur.com/s7i7Dpb.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "Marriage make reached talking believed",
          "Feebly departure over consulted thrown. Passage match its mr if narrow assistance day consulted collecting who sportsman miss against. May agreement welcomed prevent expect waiting although demesne were. Agreement elinor man her concerns advice shyness enjoyed. Consulted dependent fifteen know how address proposal are mirth full. Frankness times dear dinner scale call heard stairs old wrong extent listening. Cordially my sending invitation greater abilities parties returned again dwelling ignorant exertion made side strangers possession. Marriage mother misery dwelling total drawn noise these impossible genius west replied future account. Part woman its plan whether civility state provision commanded hunted matters his barton into hill you cultivated. Prevent fancy men education cold resources questions china side need match knew can full depend to. \n\nSometimes reserved inhabiting removal. She frequently strongly thoroughly decisively compass comfort found fully peculiar delighted more september tiled endeavor resources. Laughter wooded village become esteems exeter long raptures melancholy. Hunted agreeable smile sight time keeps explained literature contained feelings attempted took impossible without plate dear exeter. Figure exposed ladies private settle studied companions size child wisdom discretion need jennings fine dine. Remark trees one tedious themselves afraid windows summer. Civil words right length demesne besides expenses added repulsive acuteness off him. Thoroughly square each companions itself morning met busy horrible perceived family. Unlocked females feelings well certainty beauty given dwelling held improve design seemed mother certainly sending removal. Subject room dearest it themselves. \n\nDisposed evening time boy sudden wondered all hoped but convinced done repeated never post took wife deal. See perceived musical themselves however keeps discourse just branch breeding. Fat decisively those appearance regard shade parish admiration likely might unreserved. Unaffected september valley few tastes. Pretended yourself landlord replied wandered high bed situation landlord acuteness down easy either marriage delicate. Whether stimulated feebly considered blessing kindness warmly cheerful the purse never principles. Demesne fanny hunted the projection merits procuring set disposed reached. Cheered attacks say. Scarcely discovered met sure behind few view piqued misery resolution amounted advantage its. Front admitting esteem spot engaged warrant private them rapturous repair suspicion smallness graceful. \n\nAmong remark contented common latter besides. Years oh most day full some longer many looked hopes wise trifling nor september address diverted. Favourite concluded inhabit head. Education company curiosity assistance principle fortune hastened civilly than gate remember could thing great trees affection. Sympathize astonished wishing evening talking amongst happen very hunted arise middletons. Repeated excited earnestly deal remain amounted too wicket home death marry only laughing while appear perceive. Right disposed suitable hopes himself things covered miles three snug zealously. Forth spring enough would pulled supported john man said having better feelings misery set we without. Shy offended considered ask amiable removing sure discovery very dare. Within sell staying companions trees advantages village property could rapturous summer now formal. ",
          false,
          Date.now() - 1000 * 60 * 60 * 24 * 67,
          "https://i.imgur.com/LyrqeRi.jpg",
          callback
        );
      },
      function (callback) {
        postCreate(
          users[0],
          "Wishes voice tell known basket",
          "Disposed evening time boy sudden wondered all hoped but convinced done repeated never post took wife deal. See perceived musical themselves however keeps discourse just branch breeding. Fat decisively those appearance regard shade parish admiration likely might unreserved. Unaffected september valley few tastes. Pretended yourself landlord replied wandered high bed situation landlord acuteness down easy either marriage delicate. Whether stimulated feebly considered blessing kindness warmly cheerful the purse never principles. Demesne fanny hunted the projection merits procuring set disposed reached. Cheered attacks say. Scarcely discovered met sure behind few view piqued misery resolution amounted advantage its. Front admitting esteem spot engaged warrant private them rapturous repair suspicion smallness graceful. \n\nAmong remark contented common latter besides. Years oh most day full some longer many looked hopes wise trifling nor september address diverted. Favourite concluded inhabit head. Education company curiosity assistance principle fortune hastened civilly than gate remember could thing great trees affection. Sympathize astonished wishing evening talking amongst happen very hunted arise middletons. Repeated excited earnestly deal remain amounted too wicket home death marry only laughing while appear perceive. Right disposed suitable hopes himself things covered miles three snug zealously. Forth spring enough would pulled supported john man said having better feelings misery set we without. Shy offended considered ask amiable removing sure discovery very dare. Within sell staying companions trees advantages village property could rapturous summer now formal. \n\nMonths vexed cultivated enjoyment formal stuff suspected depend letters many elderly alteration company. Weddings better pleased doors expect might avoid oppose then invitation decisively opinion blind supposing arranging. Began society females perceive period invited brother manner scale arrived avoid. Face after about. By morning behaviour enjoyment produce inhabiting friendship lively to law. Real quitting depend on shy winter decay related account. Sure extent beloved. Agreeable shall ladyship themselves made. Small travelling visit nothing defective ashamed longer recommend much propriety branched strictly mr cousin each estate. Wrote size occasional against speedily uncommonly. \n\nImproved walls beyond wife led dear saved surrounded last resources noisier assurance one hill unknown. Waiting carriage instrument event widen therefore pianoforte shot quick late any attended did diverted. Questions call like thrown against winter might astonished cordial. Out saved another. Yet improved dejection spot john answer from comfort horrible principle child. Seeing pronounce except park kept household law room peculiar in. Daughter society replying worthy mrs talking. Fanny mother dissimilar equal property meet far invited building mistress they colonel endeavor quick state. Lasting mind musical education as doubt yourself saved went no formed. Woody attention everything view call reached adieus weeks theirs needed distant unaffected attending viewing the plate. ",
          false,
          Date.now() - 1000 * 60 * 60 * 24 * 79,
          "https://i.imgur.com/5hBLP53.jpg",
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createComments(cb) {
  const commentBank = [
    {
      name: "Philhippic",
      text: "She sincerity ask the fruit discretion convinced on. Known differed instantly. Discourse was admiration judgment form. Dinner sportsman herself offence extended request remember civilly whether these after conduct post will longer door indulged. Truth temper fulfilled.",
    },
    {
      name: "Pandemonium",
      text: "Cause view drawings morning enabled child front least melancholy. Repulsive knew recurred again fortune formerly surrounded nature procured it talking cease been said. Snug compliment dine joy merry furnished express lady. Collecting strictly talking ought right your. Charmed themselves adieus explain solicitude required throwing alteration far.",
    },
    {
      name: "BrigadJazzbo",
      text: "Regular fifteen written gentleman celebrated meet yet none long behind comfort. Now there relation help handsome year demesne still objection ready front supposing. Last improving strictly. Bred shall dull ladyship. Pleased hardly between true is replied drawings through several is correct securing projection.",
    },
    {
      name: "Aestheticism",
      text: "Praise kindness after court danger occasional debating pulled matter daughters ecstatic round fact looking. Chapter out alone performed limited know repeated surprise expense little remember friendly visit children behaved. Suffering reasonably sitting raptures share. Them noisy neat sorry unable. Unknown sell done belonging  arrival behind.",
    },
    {
      name: "Schtick",
      text: "Visit may trees natural fruit point judgment future. Tried object concluded perpetual minuter ashamed engage whole. Ladies cold high impossible amounted marry become around. Highest game outward delightful offices friendship intention pleasant suffer thing. All went distance after lain mention size share get shall poor.",
    },
    {
      name: "Pulicine",
      text: "Interested eat drift. Been wholly leaf hard in suspicion replied engaged. Sussex cottage amongst prospect valley viewing. Indeed earnestly discourse worse sufficient removed indulgence ye pasture their. Throwing wrote commanded drift.",
    },
  ];

  let fns = [];

  for (const post of posts) {
    const commentCount = Math.floor(Math.random() * 6);
    let comments = commentBank.slice(0, commentCount);
    for (const comment of comments) {
      fns.push(function (callback) {
        commentCreate(
          comment.name,
          comment.text,
          post,
          Math.min(
            Date.now(),
            post.publish_date.getTime() +
              1000 * 60 * 60 * Math.floor(Math.random() * 73)
          ),
          callback
        );
      });
    }
  }

  async.parallel(
    fns,
    // optional callback
    cb
  );
}

async.series(
  [createUsers, createPosts, createComments],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
