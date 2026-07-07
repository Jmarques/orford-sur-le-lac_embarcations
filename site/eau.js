// La scène « sous l'eau » de la bande d'identité (décision 0015).
//
// Un fragment shader WebGL peint la colonne d'eau (dégradé de profondeur),
// les rayons du soleil qui percent la surface, un miroitement de caustiques,
// des particules en suspension — et des remous discrets au passage ou au
// clic du pointeur.
//
// Toute la personnalisation (couleurs de l'eau, position du soleil,
// intensités, vitesse) vit dans les tokens --osl-eau-* de theme.css
// (décision 0004) : ce module les lit au chargement.
//
// Garde-fous :
//   - sans WebGL : le canvas se retire, le dégradé CSS de .bande-lac reste ;
//   - prefers-reduced-motion : une seule image fixe, aucun remous ;
//   - résolution plafonnée à 1.5× DPR, contexte low-power.

(function () {
  var canvas = document.querySelector('.eau-lac');
  if (!canvas) return;
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) {
    canvas.remove();
    return;
  }

  // --- Tokens de theme.css -------------------------------------------------

  var styles = getComputedStyle(document.documentElement);

  function tokenNombre(nom, defaut) {
    var valeur = parseFloat(styles.getPropertyValue(nom));
    return Number.isFinite(valeur) ? valeur : defaut;
  }

  // '#rrggbb' → [r, g, b] dans [0, 1] (format imposé dans theme.css).
  function tokenCouleur(nom, defaut) {
    var brut = styles.getPropertyValue(nom).trim();
    var hex = /^#([0-9a-f]{6})$/i.exec(brut);
    if (!hex) return defaut;
    var n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  var reglages = {
    surface: tokenCouleur('--osl-eau-surface', [0.914, 0.953, 0.925]),
    mi: tokenCouleur('--osl-eau-mi', [0.553, 0.741, 0.678]),
    fond: tokenCouleur('--osl-eau-fond', [0.118, 0.322, 0.298]),
    soleilX: tokenNombre('--osl-eau-soleil-x', 0.78),
    rayons: tokenNombre('--osl-eau-rayons', 1),
    miroitement: tokenNombre('--osl-eau-miroitement', 1),
    profondeur: tokenNombre('--osl-eau-profondeur', 1),
    vitesse: tokenNombre('--osl-eau-vitesse', 1.5),
    remous: tokenNombre('--osl-eau-remous', 1),
  };

  // --- Shaders --------------------------------------------------------------

  var VERTEX = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
  var FRAGMENT = [
    'precision highp float;',
    'uniform vec2 u_r;',
    'uniform float u_t;',
    'uniform vec3 u_surface;',
    'uniform vec3 u_mi;',
    'uniform vec3 u_fond;',
    'uniform float u_soleilx;',
    'uniform float u_rayf;',
    'uniform float u_causf;',
    'uniform float u_proff;',
    // Remous : jusqu'à 8 ondelettes (x, y, âge en s, amplitude) et le
    // renflement doux qui suit le pointeur (x, y, force).
    'uniform vec4 u_ondes[8];',
    'uniform vec3 u_pointeur;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
    'float noise(vec2 p){',
    '  vec2 i=floor(p);vec2 f=fract(p);',
    '  vec2 u=f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),',
    '             mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);',
    '}',
    'float fbm(vec2 p){',
    '  float v=0.0;float a=0.5;',
    '  for(int k=0;k<4;k++){v+=a*noise(p);p*=2.03;a*=0.5;}',
    '  return v;',
    '}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/u_r;',
    '  float aspect=u_r.x/u_r.y;',
    '  float prof=1.0-uv.y;',
    '  vec2 p=vec2(uv.x*aspect,uv.y);',
    // Remous : chaque ondelette est un anneau qui s'étend et s'amortit ; il
    // déplace localement l'eau (depl) et accroche un peu de lumière (lueur).
    '  vec2 depl=vec2(0.0);',
    '  float lueur=0.0;',
    '  for(int k=0;k<8;k++){',
    '    vec4 onde=u_ondes[k];',
    '    if(onde.w<=0.001) continue;',
    '    vec2 q=p-onde.xy;',
    '    float r=length(q)+0.0001;',
    '    float rayon=0.05+onde.z*0.30;',
    '    float largeur=0.03+onde.z*0.05;',
    '    float enveloppe=exp(-2.6*onde.z)*onde.w;',
    '    float anneau=exp(-((r-rayon)*(r-rayon))/(largeur*largeur));',
    '    depl+=(q/r)*anneau*enveloppe*0.08;',
    '    lueur+=anneau*enveloppe;',
    '  }',
    '  vec2 qp=p-u_pointeur.xy;',
    '  float rp=length(qp)+0.0001;',
    '  float renflement=exp(-rp*rp*14.0)*u_pointeur.z;',
    '  depl+=(qp/rp)*renflement*0.05;',
    // Colonne d'eau : claire sous la surface, verte en profondeur. Sur un
    // cadre haut et étroit (mobile), l'eau profonde commence plus bas : le
    // texte reste sur l'eau claire, lisible.
    '  float haut=clamp(1.5-aspect,0.0,1.0);',
    '  vec3 col=mix(u_surface,u_mi,smoothstep(0.0,0.6+0.25*haut,prof));',
    '  col=mix(col,u_fond,min(smoothstep(0.35+0.3*haut,1.15+0.25*haut,prof)*u_proff,1.0));',
    // Respiration générale de l'eau, remuée par les ondelettes.
    '  float houle=fbm(vec2(uv.x*3.0+depl.x*2.0+u_t*0.05,uv.y*2.0+depl.y*2.0-u_t*0.03));',
    '  col*=0.95+0.1*houle;',
    // Miroitement de caustiques près de la surface (deux nappes de bruit qui
    // glissent l'une contre l'autre), déformé par les remous.
    '  vec2 cp=(p+depl)*4.5;',
    '  float ca=fbm(cp+vec2(u_t*0.16,u_t*0.10));',
    '  float cb=fbm(cp*1.6-vec2(u_t*0.12,u_t*0.06)+3.1);',
    '  float caust=pow(clamp(ca*cb*2.4,0.0,1.0),3.0);',
    '  col+=vec3(0.92,1.0,0.96)*caust*smoothstep(0.55,0.0,prof)*0.34*u_causf;',
    // Rayons du soleil : faisceaux angulaires depuis un soleil hors cadre,
    // ondulés par du bruit et légèrement déviés par les remous.
    '  vec2 soleil=vec2(u_soleilx*aspect,1.22);',
    '  vec2 d=p+depl*0.6-soleil;',
    '  float dist=length(d);',
    '  float ang=atan(d.x,-d.y);',
    '  float fais=sin(ang*30.0+u_t*0.32+fbm(vec2(ang*4.0,u_t*0.08))*3.0)*0.5+0.5;',
    '  fais*=sin(ang*17.0-u_t*0.21)*0.5+0.5;',
    '  fais=pow(fais,2.4);',
    '  float cone=smoothstep(0.9,0.12,abs(ang));',
    '  float rayons=fais*cone*exp(-1.3*dist)*smoothstep(1.1,0.05,prof*0.9);',
    '  col+=vec3(1.0,0.98,0.9)*rayons*0.85*u_rayf;',
    // Halo du soleil diffusé par la surface — contenu pour ne jamais
    // surexposer la zone de texte.
    '  col+=vec3(1.0,0.985,0.92)*exp(-3.2*dist)*0.26*u_rayf;',
    // Reflet discret accroché par les remous.
    '  col+=vec3(0.93,1.0,0.97)*lueur*0.12;',
    // Particules en suspension, à peine visibles.
    '  float grains=smoothstep(0.986,1.0,noise(vec2(uv.x*130.0*aspect,uv.y*130.0+u_t*1.6)));',
    '  col+=vec3(0.9,0.97,0.94)*grains*0.12*smoothstep(0.95,0.25,prof);',
    // Léger vignettage pour poser la scène.
    '  float vig=smoothstep(1.45,0.45,length(uv-vec2(0.5,0.6)));',
    '  col*=mix(0.93,1.0,vig);',
    '  gl_FragColor=vec4(col,1.0);',
    '}',
  ].join('\n');

  function compiler(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Shader : ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  var programme = gl.createProgram();
  gl.attachShader(programme, compiler(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(programme, compiler(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(programme);
  if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) {
    canvas.remove();
    return;
  }
  gl.useProgram(programme);

  var tampon = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var attribut = gl.getAttribLocation(programme, 'a');
  gl.enableVertexAttribArray(attribut);
  gl.vertexAttribPointer(attribut, 2, gl.FLOAT, false, 0, 0);

  var uResolution = gl.getUniformLocation(programme, 'u_r');
  var uTemps = gl.getUniformLocation(programme, 'u_t');
  var uSurface = gl.getUniformLocation(programme, 'u_surface');
  var uMi = gl.getUniformLocation(programme, 'u_mi');
  var uFond = gl.getUniformLocation(programme, 'u_fond');
  var uSoleil = gl.getUniformLocation(programme, 'u_soleilx');
  var uRayons = gl.getUniformLocation(programme, 'u_rayf');
  var uCaustiques = gl.getUniformLocation(programme, 'u_causf');
  var uProfondeur = gl.getUniformLocation(programme, 'u_proff');
  var uOndes = gl.getUniformLocation(programme, 'u_ondes');
  var uPointeur = gl.getUniformLocation(programme, 'u_pointeur');

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Remous au pointeur ---------------------------------------------------
  // Ondelettes au survol (légères) et au clic (marquées) + renflement doux
  // qui suit le curseur avec inertie. Les âges suivent l'horloge réelle.
  // Rien en prefers-reduced-motion.

  var ondes = [];
  var pointeur = { x: -10, y: -10, force: 0, cible: 0 };
  var dernierRemous = { x: 0, y: 0, quand: 0 };

  function coordsEau(evenement) {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((evenement.clientX - rect.left) / rect.width) * (rect.width / rect.height),
      y: 1 - (evenement.clientY - rect.top) / rect.height,
    };
  }
  function ajouterOnde(evenement, amplitude) {
    var position = coordsEau(evenement);
    if (!position) return;
    ondes.push({ x: position.x, y: position.y, debut: performance.now(), amplitude: amplitude * reglages.remous });
    if (ondes.length > 8) ondes.shift();
  }

  var bande = canvas.closest('.bande-lac');
  bande.addEventListener('pointermove', function (evenement) {
    if (reduit) return;
    var position = coordsEau(evenement);
    if (!position) return;
    pointeur.x = position.x;
    pointeur.y = position.y;
    pointeur.cible = 0.45 * reglages.remous;
    var maintenant = performance.now();
    var distance = Math.hypot(position.x - dernierRemous.x, position.y - dernierRemous.y);
    if (distance > 0.09 && maintenant - dernierRemous.quand > 120) {
      dernierRemous = { x: position.x, y: position.y, quand: maintenant };
      ajouterOnde(evenement, 0.28);
    }
  });
  bande.addEventListener('pointerdown', function (evenement) {
    if (!reduit) ajouterOnde(evenement, 0.9);
  });
  bande.addEventListener('pointerleave', function () {
    pointeur.cible = 0;
  });

  // --- Rendu ------------------------------------------------------------

  function ajusterTaille() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var largeur = Math.floor(canvas.clientWidth * dpr);
    var hauteur = Math.floor(canvas.clientHeight * dpr);
    if (!largeur || !hauteur) return false;
    if (canvas.width !== largeur || canvas.height !== hauteur) {
      canvas.width = largeur;
      canvas.height = hauteur;
      gl.viewport(0, 0, largeur, hauteur);
    }
    return true;
  }

  var tableauOndes = new Float32Array(32);
  function peindre(secondes, dt) {
    if (!ajusterTaille()) return;
    // Le renflement suit le pointeur avec inertie, et se coupe net quand il
    // devient invisible (l'image redevient strictement stable au repos).
    pointeur.force += (pointeur.cible - pointeur.force) * Math.min(1, dt * 5);
    if (pointeur.cible === 0 && pointeur.force < 0.002) pointeur.force = 0;
    var maintenant = performance.now();
    ondes = ondes.filter(function (onde) { return maintenant - onde.debut < 3500; });
    tableauOndes.fill(0);
    for (var i = 0; i < ondes.length; i++) {
      tableauOndes[i * 4] = ondes[i].x;
      tableauOndes[i * 4 + 1] = ondes[i].y;
      tableauOndes[i * 4 + 2] = (maintenant - ondes[i].debut) * 0.001;
      tableauOndes[i * 4 + 3] = ondes[i].amplitude;
    }
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTemps, secondes);
    gl.uniform3f(uSurface, reglages.surface[0], reglages.surface[1], reglages.surface[2]);
    gl.uniform3f(uMi, reglages.mi[0], reglages.mi[1], reglages.mi[2]);
    gl.uniform3f(uFond, reglages.fond[0], reglages.fond[1], reglages.fond[2]);
    gl.uniform1f(uSoleil, reglages.soleilX);
    gl.uniform1f(uRayons, reglages.rayons);
    gl.uniform1f(uCaustiques, reglages.miroitement);
    gl.uniform1f(uProfondeur, reglages.profondeur);
    gl.uniform4fv(uOndes, tableauOndes);
    gl.uniform3f(uPointeur, pointeur.x, pointeur.y, pointeur.force);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  if (reduit) {
    // Une seule image, sur un temps choisi pour de beaux rayons. Repeinte —
    // même temps, donc mêmes pixels — à chaque changement de taille : une
    // frame peinte avant que la mise en page se stabilise (fontes, CSS
    // tardifs) ou avant une rotation d'écran resterait étirée sinon.
    var peindreImageFixe = function () {
      requestAnimationFrame(function () { peindre(9.0, 0.016); });
    };
    peindreImageFixe();
    if (window.ResizeObserver) new ResizeObserver(peindreImageFixe).observe(canvas);
  } else {
    // Le temps s'accumule au rythme du token de vitesse.
    var temps = 0;
    var precedent = null;
    requestAnimationFrame(function boucle(millisecondes) {
      var dt = precedent === null ? 0.016 : Math.min(0.1, (millisecondes - precedent) * 0.001);
      precedent = millisecondes;
      temps += dt * reglages.vitesse;
      peindre(temps, dt);
      requestAnimationFrame(boucle);
    });
  }
})();
