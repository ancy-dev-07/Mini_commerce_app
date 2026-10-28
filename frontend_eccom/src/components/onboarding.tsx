
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OnboardingProps = {
  onFinish: () => void;
};

const slides = [
  {
    eyebrow: 'WELCOME TO',
    title: 'Mini Product Store',
    description:
      'Your next favorite thing is just around the corner. Discover shopping made simple.',
    artwork: 'bag',
    background: '#EAF2FF',
  },
  {
    eyebrow: 'FIND YOUR FAVORITES',
    title: 'Explore Products',
    description:
      'Browse a collection of products and find something you will love.',
    artwork: 'products',
    background: '#FFF1E7',
  },
  {
    eyebrow: 'READY, SET, SHOP',
    title: 'Shopping Made Easy',
    description:
      'Discover products, add your favorites to your cart, and enjoy a simple shopping experience.',
    artwork: 'cart',
    background: '#E8F8EF',
  },
] as const;

function ShoppingIllustration({
  type,
}: {
  type: (typeof slides)[number]['artwork'];
}) {
  return (
    <View style={styles.artwork}>
      <View style={styles.artCircle} />

      {type === 'bag' && (
        <>
          <View style={[styles.sparkle, styles.sparkleOne]}>
            <Text style={styles.sparkleText}>✦</Text>
          </View>
          <View style={[styles.sparkle, styles.sparkleTwo]}>
            <Text style={styles.sparkleText}>✦</Text>
          </View>
          <View style={styles.shoppingBag}>
            <View style={styles.bagHandle} />
            <View style={styles.bagFront}>
              <Text style={styles.bagSymbol}>M</Text>
            </View>
          </View>
          <View style={[styles.miniBox, styles.miniBoxLeft]}>
            <Text style={styles.objectEmoji}>👟</Text>
          </View>
          <View style={[styles.miniBox, styles.miniBoxRight]}>
            <Text style={styles.objectEmoji}>🎁</Text>
          </View>
        </>
      )}

      {type === 'products' && (
        <>
          <View style={[styles.productTile, styles.productLeft]}>
            <Text style={styles.productEmoji}>👟</Text>
            <Text style={styles.productLabel}>STYLE</Text>
          </View>
          <View style={[styles.productTile, styles.productCenter]}>
            <Text style={styles.productEmoji}>🎧</Text>
            <Text style={styles.productLabel}>TECH</Text>
          </View>
          <View style={[styles.productTile, styles.productRight]}>
            <Text style={styles.productEmoji}>👜</Text>
            <Text style={styles.productLabel}>MORE</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>FIND IT!</Text>
          </View>
        </>
      )}

      {type === 'cart' && (
        <>
          <View style={[styles.sparkle, styles.sparkleOne]}>
            <Text style={styles.sparkleText}>✦</Text>
          </View>
          <View style={styles.cartHandle} />
          <View style={styles.cartBasket}>
            <Text style={styles.cartEmoji}>🛍️</Text>
          </View>
          <View style={styles.cartWheelLeft} />
          <View style={styles.cartWheelRight} />
          <View style={styles.cartCheck}>
            <Text style={styles.checkText}>✓</Text>
          </View>
          <View style={styles.deliveryBox}>
            <Text style={styles.objectEmoji}>📦</Text>
          </View>
        </>
      )}
    </View>
  );
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextPressed, setNextPressed] = useState(false);

  const isLastSlide = currentIndex === slides.length - 1;

  function handleScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / width,
    );

    setCurrentIndex(
      Math.max(0, Math.min(nextIndex, slides.length - 1)),
    );
  }

  function handleNext() {
    if (isLastSlide) {
      onFinish();
      return;
    }

    scrollRef.current?.scrollTo({
      x: width * (currentIndex + 1),
      animated: true,
    });
  }

  function handleSkip() {
    onFinish();
  }

  return (
    // The overlay is drawn edge-to-edge, so pad for the status and navigation bars.
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.topBar}>
        <Text style={styles.brand}>mini.store</Text>

        {!isLastSlide ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            onPress={handleSkip}
            hitSlop={12}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.slider}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.title}
            style={[styles.slide, { width }]}
          >
            <View
              style={[
                styles.illustrationArea,
                { backgroundColor: slide.background },
              ]}
            >
              <ShoppingIllustration type={slide.artwork} />
            </View>

            <View style={styles.textArea}>
              <Text style={styles.eyebrow}>{slide.eyebrow}</Text>

              <Text style={styles.title}>{slide.title}</Text>

              <Text style={styles.description}>
                {slide.description}
              </Text>
            </View>

            <View style={styles.slideNumber}>
              <Text style={styles.slideNumberText}>
                0{index + 1} / 0{slides.length}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomArea}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <View
              key={slide.title}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Static style array (not a function): NativeWind's Pressable interop
            drops function-style `style`, which left this button unstyled. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? 'Get Started' : 'Next slide'}
          onPress={handleNext}
          onPressIn={() => setNextPressed(true)}
          onPressOut={() => setNextPressed(false)}
          style={[styles.nextButton, nextPressed && styles.buttonPressed]}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18294A',
    letterSpacing: -0.5,
  },
  skipText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
    padding: 8,
  },
  skipPlaceholder: {
    width: 35,
  },
  slider: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  illustrationArea: {
    flex: 1,
    minHeight: 220,
    maxHeight: 390,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artwork: {
    width: 260,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artCircle: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  shoppingBag: {
    width: 118,
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bagHandle: {
    position: 'absolute',
    top: 4,
    width: 44,
    height: 42,
    borderWidth: 7,
    borderColor: '#243F77',
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bagFront: {
    width: 118,
    height: 106,
    borderRadius: 16,
    backgroundColor: '#4779D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagSymbol: {
    color: '#FFFFFF',
    fontSize: 45,
    fontWeight: '900',
  },
  miniBox: {
    position: 'absolute',
    width: 66,
    height: 66,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  miniBoxLeft: {
    left: 2,
    bottom: 42,
    transform: [{ rotate: '-10deg' }],
  },
  miniBoxRight: {
    right: 2,
    bottom: 72,
    transform: [{ rotate: '9deg' }],
  },
  objectEmoji: {
    fontSize: 31,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 2,
  },
  sparkleOne: {
    top: 35,
    left: 35,
  },
  sparkleTwo: {
    top: 72,
    right: 28,
  },
  sparkleText: {
    color: '#4779D5',
    fontSize: 31,
  },
  productTile: {
    position: 'absolute',
    width: 90,
    height: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  productLeft: {
    left: 4,
    top: 82,
    transform: [{ rotate: '-10deg' }],
  },
  productCenter: {
    top: 45,
    zIndex: 1,
  },
  productRight: {
    right: 4,
    top: 82,
    transform: [{ rotate: '10deg' }],
  },
  productEmoji: {
    fontSize: 37,
  },
  productLabel: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#52617A',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 25,
    backgroundColor: '#F18A52',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    transform: [{ rotate: '-5deg' }],
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
  cartHandle: {
    position: 'absolute',
    left: 45,
    top: 91,
    width: 47,
    height: 9,
    backgroundColor: '#243F77',
    borderRadius: 5,
    transform: [{ rotate: '55deg' }],
  },
  cartBasket: {
    width: 130,
    height: 100,
    marginTop: 25,
    backgroundColor: '#4779D5',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  cartEmoji: {
    fontSize: 48,
  },
  cartWheelLeft: {
    position: 'absolute',
    left: 91,
    bottom: 38,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#243F77',
  },
  cartWheelRight: {
    position: 'absolute',
    right: 89,
    bottom: 38,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#243F77',
  },
  cartCheck: {
    position: 'absolute',
    top: 27,
    right: 28,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27A875',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  deliveryBox: {
    position: 'absolute',
    bottom: 27,
    left: 15,
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
 textArea: {
  paddingTop: 16,
  alignItems: 'center',
},
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#4779D5',
    textAlign: 'center',
  },
  title: {
    marginTop: 12,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    color: '#18294A',
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    maxWidth: 330,
    fontSize: 15,
    lineHeight: 24,
    color: '#64748B',
    textAlign: 'center',
  },
  slideNumber: {
    alignItems: 'center',
    marginTop: 12,
  },
  slideNumberText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8DEE9',
  },
  activeDot: {
    width: 25,
    backgroundColor: '#4779D5',
  },
  nextButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#243F77',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 21,
  },
});